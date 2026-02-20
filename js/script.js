console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;

    // ✅ FIXED
    let a = await fetch(`/songs/${folder}/info.json`)
    let response = await a.json();
    songs = response.songs;
    
    let songUL = document.querySelector(".songlist ul")
    songUL.innerHTML = ""

    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" width="34" src="img/music.svg">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Harry</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg">
            </div>
        </li>`;
    }

    Array.from(document.querySelectorAll(".songlist li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info div").innerHTML.trim())
        })
    })

    return songs;
}


const playMusic = (track, pause = false) => {

    // ✅ FIXED
    currentSong.src = `/songs/${currFolder}/` + track

    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}


async function displayAlbums() {

    console.log("Displaying Albums")

    // ✅ FIXED — load album list
    let a = await fetch(`/songs/index.json`)
    let response = await a.json();

    let cardContainer = document.querySelector(".cardContainer")

    for (let folder of response.albums) {

        // ✅ FIXED
        let res = await fetch(`/songs/${folder}/info.json`)
        let data = await res.json();

        cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="28" height="28" viewBox="0 0 512 512">
                    <path d="M200,128 L200,384 L384,256 Z" fill="#000" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpeg">
            <h2>${data.title}</h2>
            <p>${data.description}</p>
        </div>`
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {

            // ✅ FIXED (REMOVED EXTRA songs/)
            songs = await getSongs(item.currentTarget.dataset.folder)

            playMusic(songs[0])
        })
    })
}


async function main() {

    // ✅ FIXED (REMOVED songs/)
    await getSongs("ncs")
    playMusic(songs[0], true)

    displayAlbums()

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        } else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / 
             ${secondsToMinutesSeconds(currentSong.duration)}`

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })

    previous.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    document.querySelector(".range input").addEventListener("change",
        (e) => {
            currentSong.volume = parseInt(e.target.value) / 100
            if (currentSong.volume > 0) {
                document.querySelector(".volume>img").src =
                    document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg")
            }
        })

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range input").value = 10;
        }
    })
}

main()
