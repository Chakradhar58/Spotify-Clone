console.log('Lets write JavaScript');

let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Helper: Convert seconds to mm:ss
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Fetch songs from album folder using info.json
async function getSongs(folder) {
    currFolder = folder;
    try {
        const res = await fetch(`/${folder}/info.json`);
        const data = await res.json();
        songs = data.songs;

        // Update playlist UI
        const songUL = document.querySelector(".songlist ul");
        songUL.innerHTML = "";
        songs.forEach(song => {
            const li = document.createElement("li");
            li.innerHTML = `
                <img class="invert" width="34" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Artist</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            `;
            li.addEventListener("click", () => playMusic(song));
            songUL.appendChild(li);
        });
        return songs;
    } catch (err) {
        console.error("Error fetching songs:", err);
        return [];
    }
}

// Play a specific song
function playMusic(track, pause = false) {
    if (!track) return;
    currentSong.src = `/${currFolder}/${track}`;
    document.querySelector(".songinfo").innerText = decodeURI(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
}

// Display all albums automatically
async function displayAlbums() {
    console.log("Displaying Albums");
    const cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    try {
        // Fetch all folders in /songs/ (you need actual server to list directories, for static deploy, manually create array)
        const albumFolders = ["ncs", "spiritual"]; // Add your folder names here manually if static deploy

        for (const folder of albumFolders) {
            const res = await fetch(`/songs/${folder}/info.json`);
            const data = await res.json();

            const card = document.createElement("div");
            card.className = "card";
            card.dataset.folder = folder;
            card.innerHTML = `
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 512 512">
                        <path d="M200,128 L200,384 L384,256 Z" fill="#000" />
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpeg" alt="${data.title}">
                <h2>${data.title}</h2>
                <p>${data.description}</p>
            `;
            card.addEventListener("click", async () => {
                await getSongs(`songs/${folder}`);
                playMusic(songs[0]);
            });
            cardContainer.appendChild(card);
        }
    } catch (err) {
        console.error("Error displaying albums:", err);
    }
}

// Main function
async function main() {
    await displayAlbums();

    // Play/pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Time update
    currentSong.addEventListener("timeupdate", () => {
        const timeElem = document.querySelector(".songtime");
        const circle = document.querySelector(".circle");
        timeElem.innerText = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        if (circle) circle.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = (e.offsetX / e.target.getBoundingClientRect().width);
        currentSong.currentTime = currentSong.duration * percent;
        document.querySelector(".circle").style.left = percent * 100 + "%";
    });

    // Previous/Next
    previous.addEventListener("click", () => {
        const idx = songs.indexOf(currentSong.src.split("/").pop());
        if (idx > 0) playMusic(songs[idx - 1]);
    });
    next.addEventListener("click", () => {
        const idx = songs.indexOf(currentSong.src.split("/").pop());
        if (idx < songs.length - 1) playMusic(songs[idx + 1]);
    });

    // Volume
    const volumeInput = document.querySelector(".range input");
    volumeInput.addEventListener("input", e => {
        currentSong.volume = e.target.value / 100;
        const img = document.querySelector(".volume>img");
        if (currentSong.volume > 0) img.src = img.src.replace("mute.svg", "volume.svg");
        else img.src = img.src.replace("volume.svg", "mute.svg");
    });

    // Mute toggle
    document.querySelector(".volume>img").addEventListener("click", e => {
        const img = e.target;
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            img.src = img.src.replace("volume.svg", "mute.svg");
            volumeInput.value = 0;
        } else {
            currentSong.volume = 0.1;
            img.src = img.src.replace("mute.svg", "volume.svg");
            volumeInput.value = 10;
        }
    });
}

main();
