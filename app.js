var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//global variables
const deckUrl = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1";
const valuesOfCards = {
    JACK: 2,
    QUEEN: 3,
    KING: 4,
    ACE: 11,
};
const results = [];
let deckId;
let points = 0;
let pointsOfAI = 0;
let player = "Player 1";
let numberOfPlayers;
let gameType;
let hiddenCardUrl;
let loser = false;
// fetch data from api
function getData(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url);
        return response.json();
    });
}
// get unique for one game deck id
(function getDeckId() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield getData(deckUrl);
        deckId = data.deck_id;
    });
})();
// flip the card from AI's hand which is hidden to the player
const changeHiddenCard = (url) => {
    const image = document.getElementById("hidden_card");
    image.src = url;
};
// delete cards from player's hand
const resetCards = () => {
    const cardsContainer = document.getElementById("cards_container");
    while (cardsContainer.lastElementChild) {
        cardsContainer.removeChild(cardsContainer.lastElementChild);
    }
};
// hide main menu and show multiplayer menu
const showMenuMultiplayer = () => {
    const menu = document.getElementById("menu");
    const menuMultiplayer = document.getElementById("menu_multiplayer");
    menuMultiplayer.classList.remove("no-visibility");
    menu.classList.add("no-visibility");
    setInputFilter(document.getElementById("number_of_players"), function (value) {
        return /^[2-6]*$/.test(value) && (value === "" || parseInt(value) <= 6);
    });
};
// toggle visibility of an item
const changeVisibility = (id) => {
    const item = document.getElementById(id);
    item.classList.toggle("no-visibility");
};
// shows which player is actually playing
const whoIsPlaying = () => {
    const actualPlayer = document.getElementById("now_playing");
    actualPlayer.innerHTML = `Actually playing: ${player}`;
};
// show images of card to player's hand or AI hand.
function addImage(url, whichCards, hiddenCard) {
    const img = document.createElement("img");
    const cardsContainer = document.getElementById(whichCards);
    if (hiddenCard) {
        img.src = "pics/card.png";
        img.id = "hidden_card";
    }
    else {
        img.src = url;
    }
    const image = cardsContainer.appendChild(img);
    image.setAttribute("class", "card");
}
// disable/enable buttons HIT and STAND
const disableHitAndStand = () => {
    const hitBtn = document.getElementById("hit_button");
    const standBtn = document.getElementById("stand_button");
    if (hitBtn.disabled === true || standBtn.disabled === true) {
        hitBtn.classList.remove("isDisabled");
        standBtn.classList.remove("isDisabled");
        hitBtn.disabled = false;
        standBtn.disabled = false;
    }
    else {
        hitBtn.classList.add("isDisabled");
        standBtn.classList.add("isDisabled");
        hitBtn.disabled = true;
        standBtn.disabled = true;
    }
};
// add points and check if player has more than 22 points and he lost or if he has 21/22 points and he has won.
const checkPoints = (cardValue, howManyCards) => {
    const pointsNumber = document.getElementById("points-number");
    if (isNaN(Number(cardValue)))
        points += valuesOfCards[cardValue];
    else
        points += Number(cardValue);
    pointsNumber.innerHTML = String(points);
    if (points === 21 || (points === 22 && howManyCards === 2)) {
        changeVisibility("final_statement");
        changeVisibility("game_statement");
        changeVisibility("reset_button");
        changeVisibility("buttons_container");
        changeVisibility("statements_container");
        const statement = document.getElementById("game_statement");
        playSound('win_sound');
        statement.innerHTML = `You won with ${points} points`;
        disableHitAndStand();
    }
    else if (points >= 22) {
        changeVisibility("final_statement");
        changeVisibility("game_statement");
        loser = true;
        const statement = document.getElementById("game_statement");
        statement.innerHTML = `You lose with ${points} points.`;
        playSound('lose_sound');
        // disableHitAndStand();
        if (gameType === "single") {
            changeVisibility("buttons_container");
            changeVisibility("statements_container");
            changeVisibility("reset_button");
        }
        else {
            setTimeout(function () {
                changeVisibility("final_statement");
                changeVisibility("game_statement");
                loser = false;
                disableHitAndStand();
                stand();
            }, 5000);
        }
    }
};
// take more cards
function hit(howManyCards, isAI, checkPointsOfAI) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isAI === false) {
            disableHitAndStand();
        }
        const cards = yield getData(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${howManyCards}`);
        for (let i = 0; i < howManyCards; i++) {
            if (isAI) {
                if (i === 1) {
                    addImage(cards.cards[i].image, "cards_container_ai", true);
                    hiddenCardUrl = cards.cards[i].image;
                }
                else {
                    addImage(cards.cards[i].image, "cards_container_ai", false);
                }
                if (isNaN(Number(cards.cards[i].value)))
                    pointsOfAI += valuesOfCards[cards.cards[i].value];
                else
                    pointsOfAI += Number(cards.cards[i].value);
            }
            else {
                addImage(cards.cards[i].image, "cards_container", false);
                checkPoints(cards.cards[i].value, howManyCards);
            }
        }
        if (checkPointsOfAI)
            artificalIntelligence();
        if (loser === false && isAI === false) {
            setTimeout(function () {
                disableHitAndStand();
            }, 800);
        }
    });
}
const startSingleplayer = () => {
    changeVisibility("menu");
    changeVisibility("cards_container");
    changeVisibility("buttons_container");
    changeVisibility("statements_container");
    changeVisibility("cards_container_ai");
    changeVisibility("hint_hand_dealer");
    changeVisibility("hint_hand_player");
    changeVisibility("rules");
    gameType = "single";
    checkAPI();
    hit(2, false, false);
    setTimeout(function () {
        hit(2, true, false);
    }, 100);
};
const startMultiplayer = () => {
    changeVisibility("menu_multiplayer");
    changeVisibility("cards_container");
    changeVisibility("buttons_container");
    changeVisibility("statements_container");
    changeVisibility("now_playing");
    changeVisibility("rules");
    whoIsPlaying();
    checkAPI();
    const numOfPlayers = (document.getElementById("number_of_players"));
    if (numOfPlayers.value === "") {
        numberOfPlayers = 2;
    }
    else {
        numberOfPlayers = Number(numOfPlayers.value);
    }
    hit(2, false, false);
};
// end of the turn of the player
const stand = () => {
    if (gameType === "single") {
        artificalIntelligence();
    }
    else {
        results.push([player, points]);
        nextPlayer();
        numberOfPlayers--;
        if (numberOfPlayers === 0)
            checkWinner();
    }
};
// end turn of actual player, start turn of the next player
const nextPlayer = () => {
    player = player.slice(0, player.length - 1) + (Number(player.slice(-1)) + 1);
    points = 0;
    whoIsPlaying();
    resetCards();
    hit(2, false, false);
};
// check who is the closest to 21 points
const checkWinner = () => {
    const statement = document.getElementById("game_statement");
    let sortedWinners = results
        .filter((element) => element[1] < 22)
        .sort((a, b) => b[1] - a[1]);
    sortedWinners = sortedWinners.filter((element) => element[1] === sortedWinners[0][1]);
    changeVisibility("cards_container");
    changeVisibility("buttons_container");
    changeVisibility("statements_container");
    changeVisibility("game_statement");
    changeVisibility("final_statement");
    changeVisibility("now_playing");
    changeVisibility("reset_button");
    if (sortedWinners.length >= 2) {
        const players = sortedWinners
            .map((element) => element[0])
            .map((element, index) => {
            if (index < sortedWinners.length - 2)
                return (element = element + ",");
            else
                return element;
        });
        players.splice(players.length - 1, 0, "and");
        statement.innerHTML = `There is a tie between ${players.join(" ")}.`;
    }
    else if (sortedWinners.length === 1) {
        playSound('win_sound');
        statement.innerHTML = `${sortedWinners[0][0]} has won with ${sortedWinners[0][1]} points!`;
    }
    else {
        playSound('lose_sound');
        statement.innerHTML = `Everybody are losing.`;
    }
};
// AI behavior when player press STAND
const artificalIntelligence = () => {
    if (pointsOfAI < 17) {
        hit(1, true, true);
    }
    else {
        changeVisibility("final_statement");
        changeVisibility("buttons_container");
        changeVisibility("statements_container");
        changeVisibility("game_statement");
        changeVisibility("reset_button");
        changeHiddenCard(hiddenCardUrl);
        const statement = document.getElementById("game_statement");
        if (points < pointsOfAI && pointsOfAI <= 21) {
            playSound('lose_sound');
            statement.innerHTML = `AI has won with ${pointsOfAI} points!`;
        }
        else if (points === pointsOfAI) {
            statement.innerHTML = `There is a tie with ${points} points!`;
        }
        else {
            playSound('win_sound');
            statement.innerHTML = `You won with ${points} points`;
        }
    }
};
// filter an input of number of players in multiplayer mode
function setInputFilter(textbox, inputFilter) {
    [
        "input",
        "keydown",
        "keyup",
        "mousedown",
        "mouseup",
        "select",
        "contextmenu",
        "drop",
    ].forEach(function (event) {
        textbox.addEventListener(event, function () {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            }
            else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            }
            else {
                this.value = "";
            }
        });
    });
}
const checkAPI = () => {
    if (deckId === undefined) {
        const API = document.getElementById("api_problem");
        API.classList.remove('no-visibility');
        return;
    }
    return;
};
const playSound = (id) => {
    const sound = (document.getElementById(id));
    sound.play();
};
//# sourceMappingURL=app.js.map