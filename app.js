//GLOBALS

const deckUrl = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1';
let deckId;
const valuesOfCards = {
    'JACK': 2,
    'QUEEN': 3,
    'KING': 4,
    'ACE': 11,
}

let points = 0;
let pointsOfAI = 0;

let player = 'Player 1';
const results = [];
let numberOfPlayers;


let gameType;
let hiddenCardUrl;

async function getData(url) {

    const response = await fetch(url);
    return response.json()

};

(async function game() {
    const data = await getData(deckUrl);
    deckId = data.deck_id;
})();

async function addImage(url, whichCards) {

    const img = document.createElement("img");

    const cardsContainer = document.getElementById(whichCards);

    img.src = url;

    const image = cardsContainer.appendChild(img);

    image.setAttribute("class", 'card');
}

const disableHit = () => {
    const hitBtn = document.getElementById('hit_button');
    const standBtn = document.getElementById('stand_button');

    if (hitBtn.disabled === true || standBtn.disabled === true) {
        hitBtn.classList.remove('isDisabled');
        standBtn.classList.remove('isDisabled');
        hitBtn.disabled = false;
        standBtn.disabled = false;
    }
    else {
        hitBtn.classList.add('isDisabled');
        standBtn.classList.add('isDisabled');
        hitBtn.disabled = true;
        standBtn.disabled = true;
    }
}

async function hit(howMuch) {

    disableHit();

    const cards = await getData(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${howMuch}`);

    for (let i = 0; i < howMuch; i++) {

        await addImage(cards.cards[i].image, 'cards_container');

        checkPoints(cards.cards[i].value, howMuch);
    }

    setTimeout(function () {
        disableHit();
    }, 500)
}

const checkPoints = (cardValue, howMuch) => {

    const pointsNumber = document.getElementById("points-number");

    if (isNaN(Number(cardValue))) points += valuesOfCards[cardValue];
    else points += Number(cardValue);

    pointsNumber.innerHTML = points;

    if (points === 21 || (points === 22 && howMuch === 2)) {
        changeVisibility('final_statement');
        changeVisibility("game_statement");
        changeVisibility('reset_button');
        changeVisibility('buttons_container');
        changeVisibility('statements_container');
        const statement = document.getElementById("game_statement");
        statement.innerHTML = `You win with ${points} points`;
        disableHit();

    } else if (points >= 22) {
        changeVisibility('final_statement');
        changeVisibility("game_statement");
        const statement = document.getElementById("game_statement");
        statement.innerHTML = `You lose with ${points} points.`;
        disableHit();

        if (gameType === 'single') {
            changeVisibility('buttons_container');
            changeVisibility('statements_container');
            changeVisibility('reset_button');

        } else {
            setTimeout(function () {
                changeVisibility('final_statement');
                changeVisibility("game_statement");
                disableHit();
                stand();
            }, 5000)
        }



    }
}

const stand = () => {

    if (gameType === 'single') {

        artificalIntelligence();

    } else {
        results.push([player, points]);

        nextPlayer();
        numberOfPlayers--;

        if (numberOfPlayers === 0) checkWinner();
    }

}

const nextPlayer = () => {

    player = player.slice(0, player.length - 1) + (Number(player.slice(-1)) + 1);
    points = 0;
    whoIsPlaying();
    resetCards();

    hit(2);

}

const checkWinner = () => {

    const statement = document.getElementById("game_statement");

    let sortedWinners = results.filter(element => element[1] < 22).sort((a, b) => b[1] - a[1]);
    sortedWinners = sortedWinners.filter(element => element[1] === sortedWinners[0][1]);

    changeVisibility('cards_container');
    changeVisibility('buttons_container');
    changeVisibility('statements_container');
    changeVisibility('game_statement');
    changeVisibility('final_statement');
    changeVisibility('now_playing');
    changeVisibility('reset_button');

    if (sortedWinners.length >= 2) {

        const players = sortedWinners.map(element => element[0]).map((element, index) => {
            if (index < sortedWinners.length - 2) return element = element + ',';
            else return element;
        });

        players.splice(players.length - 1, 0, 'and');

        statement.innerHTML = `There is a tie between ${players.join(' ')}.`;

    } else if (sortedWinners.length === 1) {

        statement.innerHTML = `${sortedWinners[0][0]} wins with ${sortedWinners[0][1]} points!`;

    } else {

        statement.innerHTML = `Everybody lose.`;

    }

}

const resetCards = () => {
    const cardsContainer = document.getElementById("cards_container");
    while (cardsContainer.lastElementChild) {
        cardsContainer.removeChild(cardsContainer.lastElementChild);
    }
}

const showMenuMultiplayer = () => {
    const menu = document.getElementById('menu');
    const menuMultiplayer = document.getElementById('menu_multiplayer');
    menuMultiplayer.classList.remove('no-visibility');
    menu.classList.add('no-visibility');
}

function inputMinMax(value, min, max) {
    if (parseInt(value) < min || isNaN(parseInt(value)))
        return min;
    else if (parseInt(value) > max)
        return max;
    else return value;
}

const changeVisibility = id => {
    const item = document.getElementById(id);
    item.classList.toggle('no-visibility');
}

const startMulti = () => {
    changeVisibility('menu_multiplayer');
    changeVisibility('cards_container');
    changeVisibility('buttons_container');
    changeVisibility('statements_container');
    changeVisibility('now_playing');
    changeVisibility('rules');
    whoIsPlaying();

    numberOfPlayers = document.getElementById('number_of_players').value;

    hit(2);

}

const whoIsPlaying = () => {
    const playerxx = document.getElementById('now_playing');
    playerxx.innerHTML = `Actually playing: ${player}`;
}

const reset = () => {
    window.location.reload(true);
}

const startSingle = () => {
    changeVisibility('menu');
    changeVisibility('cards_container');
    changeVisibility('buttons_container');
    changeVisibility('statements_container');
    changeVisibility('cards_container_ai');
    changeVisibility('hint_hand_dealer');
    changeVisibility('hint_hand_player');
    changeVisibility('rules');
    gameType = "single";

    hit(2);

    hitByAI(2);

}

const artificalIntelligence = () => {

    if (pointsOfAI < 17) {
        hitByAI(1, true);
    } else {
        changeVisibility('final_statement');
        changeVisibility('buttons_container');
        changeVisibility('statements_container');
        changeVisibility('game_statement');
        changeVisibility('reset_button');

        changeHiddenCard(hiddenCardUrl);
        console.log(points, pointsOfAI);

        const statement = document.getElementById("game_statement");
        if (points < pointsOfAI && pointsOfAI <= 21) {
            statement.innerHTML = `AI wins with ${pointsOfAI} points!`;
        } else if (points === pointsOfAI) {
            statement.innerHTML = `There is a tie with ${points} points!`;
        } else {
            statement.innerHTML = `Player wins with ${points} points`;
        }
    }

}

async function hitByAI(howMuch, checkPoints) {

    const cards = await getData(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${howMuch}`);

    for (let i = 0; i < howMuch; i++) {
        if (i === 1) {
            await addImageByAI(cards.cards[i].image, 'cards_container_ai', true);
            hiddenCardUrl = cards.cards[i].image;
        } else {
            await addImageByAI(cards.cards[i].image, 'cards_container_ai');
        }
        if (isNaN(Number(cards.cards[i].value))) pointsOfAI += valuesOfCards[cards.cards[i].value];
        else pointsOfAI += Number(cards.cards[i].value);
    }

    if (checkPoints) artificalIntelligence();

}

async function addImageByAI(url, whichCards, firstCard) {

    const img = document.createElement("img");

    const cardsContainer = document.getElementById(whichCards);

    if (firstCard) {
        img.src = 'card.png';
        img.id = 'hidden_card';
    }
    else {
        img.src = url;
    }

    const image = cardsContainer.appendChild(img);

    image.setAttribute("class", 'card');
}

const changeHiddenCard = url => {
    const image = document.getElementById('hidden_card');
    image.src = url;
}