console.log("Lets write JavaScript");

let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Format time mm:ss
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    let m = Math.floor(seconds / 60);
    let s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Fetch songs from selected album
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

// Play music properly (stops previous)
function playMusic(track) {
    if (!track) return;

    currentSong.pause();
    currentSong.currentTime = 0;

    currentSong.src = `/songs/${currFolder}/${track}`;
    currentSong.load();
    currentSong.play();

    document.querySelector(".songinfo").innerText = track;
    document.getElementById("play").src = "img/pause.svg";
}

// Display album cards dynamically
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
            <img src="/songs/${folder}/cover.jpeg">
            <h2>${info.title}</h2>
            <p>${info.description}</p>
        `;

        card.addEventListener("click", async () => {
            await getSongs(folder);
            playMusic(songs[0]);
        });

        cardContainer.appendChild(card);
    }
}

// MAIN
async function main() {
    await displayAlbums();

    const playBtn = document.getElementById("play");
    const nextBtn = document.getElementById("next");
    const prevBtn = document.getElementById("previous");
    const volumeInput = document.querySelector(".range input");
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

    // Volume slider (WORKING)
    volumeInput.addEventListener("input", (e) => {
        currentSong.volume = e.target.value / 100;
    });

    // Time update + seek circle
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
        const percent =
            e.offsetX / seekbar.getBoundingClientRect().width;
        currentSong.currentTime = currentSong.duration * percent;
    });
}

main();
