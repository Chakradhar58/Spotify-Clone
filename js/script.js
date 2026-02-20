console.log("Lets write JavaScript");

let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Convert seconds to mm:ss
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    let m = Math.floor(seconds / 60);
    let s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Fetch songs from album folder
async function getSongs(folder) {
    currFolder = folder;

    const res = await fetch(`/songs/${folder}/info.json`);
    const data = await res.json();

    songs = data.songs;

    const songList = document.querySelector(".songlist ul");
    songList.innerHTML = "";

    songs.forEach(song => {
        let li = document.createElement("li");
        li.innerHTML = `
            <img width="34" src="img/music.svg">
            <div class="info">
                <div>${song}</div>
            </div>
        `;

        li.addEventListener("click", () => {
            playMusic(song);
        });

        songList.appendChild(li);
    });

    return songs;
}

// Play music
function playMusic(track, pause = false) {
    currentSong.src = `/songs/${currFolder}/${track}`;

    document.querySelector(".songinfo").innerText = track;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";

    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "img/pause.svg";
    }
}

// Display all albums from index.json
async function displayAlbums() {
    const res = await fetch("/songs/index.json");
    const data = await res.json();

    const cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    for (let folder of data.albums) {
        const infoRes = await fetch(`/songs/${folder}/info.json`);
        const info = await infoRes.json();

        let card = document.createElement("div");
        card.classList.add("card");
        card.dataset.folder = folder;

        card.innerHTML = `
            <img src="/songs/${folder}/cover.jpeg" alt="${info.title}">
            <h2>${info.title}</h2>
            <p>${info.description}</p>
        `;

        // Click album → load songs + play first
        card.addEventListener("click", async () => {
            await getSongs(folder);
            playMusic(songs[0]);
        });

        cardContainer.appendChild(card);
    }
}

// Main
async function main() {
    await displayAlbums();

    // Play / Pause
    const playBtn = document.getElementById("play");
    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "img/pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "img/play.svg";
        }
    });

    // Time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent =
            e.offsetX / e.target.getBoundingClientRect().width;
        currentSong.currentTime = currentSong.duration * percent;
    });

    // Next
    document.getElementById("next").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    // Previous
    document.getElementById("previous").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });
}

main();
