const grid = document.querySelector('.grid')
const startButton = document.querySelector('button')
const scoreParagraph = document.querySelector('#score')
const livesParagraph = document.querySelector('#lives')
const rulesParagraph = document.querySelector('#rules')
const width = 11
const cells = []
let laserBasePosition = 115
let laser = laserBasePosition 
let bombPosition = 0
let score = 0
let lives = 3
let intervalId1 = 0
let intervalId2 = 0
let intervalId3 = 0
let intervalId4 = 0
//let intervalAmount = 2000
scoreParagraph.innerHTML = `Score: ${score}`
rulesParagraph.innerHTML = `Use &#8592;  &#8594; to move and '<em>S</em>' key to shoot!`
livesParagraph.innerHTML = `Lives : ${lives}`
let playerScores = []
const scoresList = document.querySelector('ol')
const audioPlayer = document.querySelector('audio')

//! Grid

for (let index = 0; index < width ** 2; index++) {
  const div = document.createElement('div')
  grid.appendChild(div)
  //div.innerHTML = index
  div.style.width = `${100 / width}%`
  div.style.height = `${100 / width}%`
  cells.push(div)
}


//! END

function resetGame() {

  clearInterval(intervalId1)
  clearInterval(intervalId2)
  clearInterval(intervalId3)
  clearInterval(intervalId4)

  cells.forEach((element, index) => {
    cells[index].classList.remove('invader')
    cells[index].classList.remove('bomb')
    cells[index].classList.remove('laser')
    cells[index].classList.remove('laserBase')
  })

  //! score board 

  const newName = prompt('What\'s your name?')
  const player = { name: newName, score: score }
  playerScores.push(player)
  
  if (localStorage) {
    localStorage.setItem('playerScores', JSON.stringify(playerScores))
  }

  orderAndDisplayScores()

  lives = 3
  score = 0
  scoreParagraph.innerHTML = `Score: ${score}`
  intervalId1 = 0
  intervalId2 = 0
  intervalId3 = 0
  intervalId4 = 0
}

//! local storage 

function orderAndDisplayScores() {
  const array = playerScores
    .sort((playerA, playerB) => playerB.score - playerA.score)
    .map(player => {
      return `<li>
      <strong>${player.name}</strong> scored <em>${player.score}</em> points
      </li>`
    })
  scoresList.innerHTML = array.join('')
}

if (localStorage) {
  playerScores = JSON.parse(localStorage.getItem('playerScores')) || []
  orderAndDisplayScores()
}

//! Clicking on Start button

startButton.addEventListener('click', (e) => {

  cells[laserBasePosition].classList.add('laserBase')

  // audioPlayer.src = './sound/ambiance.wav'
  // audioPlayer.play()



  //! invaders positionned in the grid

  for (let index = 0; index < (width * 3); index++) {
    if ((index % width ) < Math.ceil(width / 2)) {
      cells[index].classList.add('invader')
    }
  }

  //! invaders moving 

  let isMovingRight = true

  if (intervalId4 !== 0) {
    return
  }
  intervalId4 = setInterval(() => {
    
    const invadersList2 = []
    let isTouchingRight = false
    let isTouchingLeft = false
    let isAtBottom = false

    cells.forEach((item, index) => {
      if (item.classList.contains('invader')) {
        invadersList2.push(index)

        if (index % width === width - 1) {
          isTouchingRight = true
        }
        if (index % width === 0) {
          isTouchingLeft = true
        }
        if ((index > (width ** 2) - width - 1)) {
          isAtBottom = true
        }
      } 
    })

    invadersList2.forEach((element) => {
      cells[element].classList.remove('invader')
    })

    if (isMovingRight && !isTouchingRight) {
      invadersList2.forEach((element) => {
        cells[element + 1].classList.add('invader')
      })
    } else if (isTouchingRight && isMovingRight) {
      invadersList2.forEach((element) => {
        cells[element + width].classList.add('invader')
        isMovingRight = false
      }) 
    } else if (!isMovingRight && !isTouchingLeft) {
      invadersList2.forEach((element) => {
        cells[element - 1].classList.add('invader')
      })
    } else if (isTouchingLeft && !isMovingRight) {
      invadersList2.forEach((element) => {
        cells[element + width].classList.add('invader')
        isMovingRight = true
      })  
    } 
    if (isAtBottom) {
      alert(`GAME OVER! You scored ${score} points!`)
      resetGame()
    }

  }, 1300)


  //! bombs start positions

  if (intervalId2 !== 0) {
    return
  }
  intervalId2 = setInterval(() => {

    const invadersList = []
  
    cells.forEach((item, index) => {
      if (item.classList.contains('invader')) {
        invadersList.push(index)
      } 
    })
    if (invadersList.length !== 0) {
      bombPosition = invadersList[Math.floor(Math.random() * invadersList.length)]

      while (cells[bombPosition + width].classList.contains('invader')) {
        bombPosition += width
      }
      while (!cells[bombPosition + width].classList.contains('invader')) {
        bombPosition -= width
      }
      cells[bombPosition + width].classList.add('bomb')
    } else if (invadersList.length === 0) {
      alert(`YOU WIN! You scored ${score} points!`)
      resetGame()
    }
  }, 2000)


  //! Bombs dropping 

  if (intervalId3 !== 0) {
    return
  }
  intervalId3 = setInterval(() => {
    
    const bombsList = []

    cells.forEach((item, index) => {
      if (item.classList.contains('bomb')) {
        bombsList.push(index)
      }
    })

    bombsList.forEach((item) => {
      if (!(item > (width ** 2) - width - 1)) {
        cells[item].classList.remove('bomb')
        item += width
        cells[item].classList.add('bomb')
        if (cells[item].classList.contains('bomb') && cells[item].classList.contains('laserBase')) {
          lives--
          cells[item].classList.remove('bomb')
          audioPlayer.src = './sound/explosion.wav'
          audioPlayer.play()
          if (lives === 0) {
            cells[item].classList.remove('bomb')
            alert(`GAME OVER! Your final score is ${score}!`)
            resetGame()
          }  
        } 
        
      } else {
        cells[item].classList.remove('bomb')
      }  
    })

    livesParagraph.innerHTML = `Lives : ${lives}`
    
  }, 500)

})



//! key stroke commands

document.addEventListener('keydown', (event) => {
  const key = event.key
  if (key === 'ArrowLeft' && !(laserBasePosition % width === 0)) {
    cells[laserBasePosition].classList.remove('laserBase')
    laserBasePosition -= 1
    cells[laserBasePosition].classList.add('laserBase')
  } else if (key === 'ArrowRight' && !(laserBasePosition % width === width - 1)) {
    cells[laserBasePosition].classList.remove('laserBase')
    laserBasePosition += 1
    cells[laserBasePosition].classList.add('laserBase')
  } else if (key === 's' && !cells[laser].classList.contains('laser')) {
    laser = laserBasePosition - width
    cells[laser].classList.add('laser')
    audioPlayer.src = './sound/shoot.wav'
    audioPlayer.play()

    //! laser shots

    if (intervalId1 !== 0) {
      return
    }
    intervalId1 = setInterval(() => {

      if (cells[laser].classList.contains('laser') && !(laser < width)) {
        cells[laser].classList.remove('laser')
        laser -= width
        cells[laser].classList.add('laser')
        if (cells[laser].classList.contains('laser') && cells[laser].classList.contains('invader')) {
          score += 10
          cells[laser].classList.remove('laser')
          cells[laser].classList.remove('invader')
          audioPlayer.src = './sound/invaderkilled.wav'
          audioPlayer.play()
          scoreParagraph.innerHTML = `Score: ${score}`
        } else if (cells[laser].classList.contains('laser') && cells[laser].classList.contains('bomb')) {
          cells[laser].classList.remove('laser')
          cells[laser].classList.remove('bomb')
        }
      } else {
        cells[laser].classList.remove('laser')
      }
    }, 200)
  } 
  
})