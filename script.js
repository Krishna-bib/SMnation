
let songs;
let currFolder;
async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/micBeat/songs/${folder}/`);
    let response = await a.text();


    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.querySelectorAll("a");
    songs = [];

    for (let ele of as) {

        if (ele.href.endsWith(".mp3")) {
            songs.push(ele.href.split(`/songs/${folder}/`)[1]);
        }
    }

    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML = "";
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li>
        
            <img src="img/music.svg" alt="" class="invert">
            <div class="info">
              <div>${song.replaceAll("%20%", " ").replaceAll("%20", " ")}</div>
            
            </div>
            <div class="playnow">
              <img src="img/play.svg" alt="" class="invert">
            </div> </li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", function () {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })

}
let currsong = new Audio();
const playmusic = (track, pause = false) => {
    // audio.src="/micBeat/songs/" + track;
    currsong.src = `/micBeat/songs/${currFolder}/` + track;
    if (!pause) {
        currsong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo .actual").innerText = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00";
}

async function main() {

    await getsongs("Lunch_Break");
    playmusic(songs[0], true);

    async function displayAlbums() {
        console.log("displaying albums")
        let a = await fetch(`/songs/`)
        let response = await a.text();
        let div = document.createElement("div")
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a")
        let cardContainer = document.querySelector(".cardContainer")
        let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
                let folder = e.href.split("/").slice(-2)[0]
                // Get the metadata of the folder
                let a = await fetch(`/songs/${folder}/info.json`)
                let response = await a.json();
                cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                            stroke-linejoin="round" />
                    </svg>
                </div>
    
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`
            }
        }
    }

    play.addEventListener("click", () => {
        if (currsong.paused) {
            currsong.play();
            play.src = "img/pause.svg";
        }
        else {
            currsong.pause();
            play.src = "img/play.svg";
        }
    })
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    currsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currsong.currentTime)}/${formatTime(currsong.duration)}`;
        document.querySelector(".circle").style.left = (currsong.currentTime / currsong.duration) * 100 + "%";
    }
    )
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width * 100);
        document.querySelector(".circle").style.left = percent + "%";
        currsong.currentTime = currsong.duration * percent / 100;
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })

    document.querySelector(".close").addEventListener("click", () => {

        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currsong.src.split("/").slice(-1)[0]);

        if ((index - 1) > 0) {
            playmusic(songs[index - 1]);

        }
        else {
            playmusic(songs[0]);
        }
    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(currsong.src.split("/").slice(-1)[0]);
        console.log(songs);

        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
            console.log(index + 1);
        }
        else {
            playmusic(songs[0]);
        }
    })
    currsong.addEventListener("ended", () => {
        let index = songs.indexOf(currsong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        } else {
            playmusic(songs[0]); // loop to first song
        }
    });
     
    
    const volumeBar = document.getElementById("volumeBar");

    volumeBar.addEventListener("input", () => {
        currsong.volume = volumeBar.value;
        if (volumeBar.value == 0.0) {
            volumeimg.src = "img/mute.svg";

        }
        else {
            volumeimg.src = "img/volume.svg";
        }

    });

    let volumeimg = document.querySelector(".volume-control img");
    volumeimg.addEventListener("click", () => {

        if (currsong.volume != 0) {
            currsong.volume = 0.0;
            volumeimg.src = "img/mute.svg";
            volumeBar.value = 0.0;
        }
        else {
            currsong.volume = volumeBar.value;
            volumeimg.src = "img/volume.svg";

        }
    })

    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            const folder = card.dataset.floder;
            if (folder) {
                await getsongs(folder);
                playmusic(songs[0]);
            }
        });
    });



}
main();



