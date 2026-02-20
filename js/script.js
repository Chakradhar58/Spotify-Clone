console.log("Lets write JavaScript");

let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Convert seconds to mm:ss
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2,'0')}:${String(remainingSeconds).padStart(2,'0')}`;
}

// Load songs from album folder
async function getSongs(folder) {
    currFolder = folder;
    try {
        const res = await fetch(`/${folder}/info.json`);
        const info = await res.json();
        songs = info.songs;

        // Show songs in playlist
        const songUL = document.querySelector(".songlist ul");
        songUL.innerHTML = "";
        songs.forEach(song => {
            songUL.innerHTML += `
            <li>
                <img class="invert" width="34" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20"," ")}</div>
                    <div>${info.title}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
        });

        // Attach click event for each song
        Array.from(songUL.getElementsByTagName("li")).forEach(li => {
            li.addEventListener("click", () => {
                playMusic(li.querySelector(".info div").innerHTML.trim());
            });
        });

    } catch (err) {
        console.error("Failed to get songs:", err);
    }
}

// Play a song
function playMusic(track, pause=false){
    currentSong.src = `/${currFolder}/` + track;
    if(!pause){
        currentSong.play();
        document.getElementById("play").src="img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// Display all albums dynamically
async function displayAlbums() {
    console.log("Displaying Albums");
    const cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    try {
        const res = await fetch("/songs/index.json");
        const data = await res.json();
        const albums = data.albums;

        for(const folder of albums){
            try {
                const infoRes = await fetch(`/songs/${folder}/info.json`);
                const info = await infoRes.json();

                cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 512 512">
                            <path d="M200,128 L200,384 L384,256 Z" fill="#000"/>
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpeg" alt="">
                    <h2>${info.title}</h2>
                    <p>${info.description}</p>
                </div>`;
            } catch(err){
                console.warn(`Failed to load album ${folder}`, err);
            }
        }

        // Add click event for album cards
        Array.from(document.getElementsByClassName("card")).forEach(card => {
            card.addEventListener("click", async e => {
                const folder = e.currentTarget.dataset.folder;
                await getSongs(`songs/${folder}`);
                playMusic(songs[0]);
            });
        });

    } catch(err){
        console.error("Failed to load albums index", err);
    }
}

// Main function
async function main() {
    await getSongs("songs/ncs"); // Load default album
    playMusic(songs[0], true);
    await displayAlbums();        // Display all albums

    // Player controls
    const playBtn = document.getElementById("play");
    const nextBtn = document.getElementById("next");
    const prevBtn = document.getElementById("previous");

    playBtn.addEventListener("click", () => {
        if(currentSong.paused){
            currentSong.play();
            playBtn.src = "img/pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "img/play.svg";
        }
    });

    nextBtn.addEventListener("click", () => {
        let idx = songs.indexOf(currentSong.src.split("/").pop());
        if(idx + 1 < songs.length) playMusic(songs[idx + 1]);
    });

    prevBtn.addEventListener("click", () => {
        let idx = songs.indexOf(currentSong.src.split("/").pop());
        if(idx - 1 >= 0) playMusic(songs[idx - 1]);
    });

    // Time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = e.offsetX / e.target.getBoundingClientRect().width;
        currentSong.currentTime = currentSong.duration * percent;
        document.querySelector(".circle").style.left = percent * 100 + "%";
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Volume
    const volumeInput = document.querySelector(".range input");
    const volumeImg = document.querySelector(".volume>img");

    volumeInput.addEventListener("change", e => {
        currentSong.volume = e.target.value / 100;
        if(currentSong.volume > 0) volumeImg.src = volumeImg.src.replace("mute.svg","volume.svg");
    });

    volumeImg.addEventListener("click", () => {
        if(currentSong.volume > 0){
            currentSong.volume = 0;
            volumeInput.value = 0;
            volumeImg.src = volumeImg.src.replace("volume.svg","mute.svg");
        } else {
            currentSong.volume = 0.1;
            volumeInput.value = 10;
            volumeImg.src = volumeImg.src.replace("mute.svg","volume.svg");
        }
    });
}

main();
