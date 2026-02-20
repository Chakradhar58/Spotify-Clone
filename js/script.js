document.addEventListener("DOMContentLoaded", () => {

let currentSong = new Audio();
let songs = [];
let currFolder = "";
let currentIndex = 0;   // 🔥 FIXED INDEX TRACKING

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

    songs.forEach((song, index) => {
        let li = document.createElement("li");
        li.textContent = song;

        li.addEventListener("click", () => {
            currentIndex = index;     // 🔥 track index
            playMusic(song);
        });

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
            currentIndex = 0;      // 🔥 reset index
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
    const volumeSlider = document.getElementById("volume");
    const seekbar = document.querySelector(".seekbar");
    const circle = document.querySelector(".circle");

    // Play / Pause
    playBtn.addEventListener("click", () => {

        if (!currentSong.src) return; // no song selected

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

    // Update time + seekbar
    currentSong.addEventListener("timeupdate", () => {

        if (!isNaN(currentSong.duration)) {

            document.querySelector(".songtime").innerText =
                `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;

            let percent =
                (currentSong.currentTime / currentSong.duration) * 100;

            circle.style.left = percent + "%";
        }
    });

    // Seekbar click
    seekbar.addEventListener("click", (e) => {

        if (!isNaN(currentSong.duration)) {

            const rect = seekbar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;

            currentSong.currentTime =
                currentSong.duration * percent;

            circle.style.left = percent * 100 + "%";
        }
    });

    // Next
    nextBtn.addEventListener("click", () => {

        if (currentIndex < songs.length - 1) {
            currentIndex++;
            playMusic(songs[currentIndex]);
        }
    });

    // Previous
    prevBtn.addEventListener("click", () => {

        if (currentIndex > 0) {
            currentIndex--;
            playMusic(songs[currentIndex]);
        }
    });

    // Auto next when song ends
    currentSong.addEventListener("ended", () => {
        if (currentIndex < songs.length - 1) {
            currentIndex++;
            playMusic(songs[currentIndex]);
        }
    });
}

main();

});
