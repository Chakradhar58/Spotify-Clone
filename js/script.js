document.addEventListener("DOMContentLoaded", () => {

let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Format time
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    let m = Math.floor(seconds / 60);
    let s = Math.floor(seconds % 60);
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

// Load songs
async function getSongs(folder) {
    currFolder = folder;

    const res = await fetch(`/songs/${folder}/info.json`);
    const data = await res.json();
    songs = data.songs;

    const ul = document.querySelector(".songlist ul");
    ul.innerHTML = "";

    songs.forEach(song => {
        let li = document.createElement("li");
        li.textContent = song;
        li.addEventListener("click", () => playMusic(song));
        ul.appendChild(li);
    });

    return songs;
}

// Play music
function playMusic(track) {

    currentSong.pause();
    currentSong.currentTime = 0;

    currentSong.src = `/songs/${currFolder}/${track}`;
    currentSong.load();
    currentSong.play();

    document.querySelector(".songinfo").innerText = track;
    document.getElementById("play").src = "img/pause.svg";
}

// Display albums
async function displayAlbums() {

    const res = await fetch("/songs/index.json");
    const data = await res.json();

    const container = document.querySelector(".cardContainer");
    container.innerHTML = "";

    for (let folder of data.albums) {

        const infoRes = await fetch(`/songs/${folder}/info.json`);
        const info = await infoRes.json();

        let card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="/songs/${folder}/cover.jpeg">
            <h2>${info.title}</h2>
            <p>${info.description}</p>
        `;

        card.addEventListener("click", async () => {
            await getSongs(folder);
            playMusic(songs[0]);
        });

        container.appendChild(card);
    }
}

async function main() {

    await displayAlbums();

    const playBtn = document.getElementById("play");
    const nextBtn = document.getElementById("next");
    const prevBtn = document.getElementById("previous");
    const volumeSlider = document.querySelector(".range input");
    const seekbar = document.querySelector(".seekbar");
    const circle = document.querySelector(".circle");

    // Play / Pause
    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "img/pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "img/play.svg";
        }
    });

    // Volume
    volumeSlider.addEventListener("input", (e) => {
        currentSong.volume = e.target.value / 100;
    });

    // Time update
    currentSong.addEventListener("timeupdate", () => {

        if (!isNaN(currentSong.duration)) {

            document.querySelector(".songtime").innerText =
                `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;

            circle.style.left =
                (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    // Seekbar click
    seekbar.addEventListener("click", (e) => {

        if (!isNaN(currentSong.duration)) {

            const percent =
                e.offsetX / seekbar.getBoundingClientRect().width;

            currentSong.currentTime =
                currentSong.duration * percent;
        }
    });

    // Next
    nextBtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    // Previous
    prevBtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });
}

main();

});
