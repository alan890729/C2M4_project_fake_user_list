let filteredFriendsList = [] // 經過搜尋框鍵入的關鍵字篩選後的friendsList
const USERS_PER_PAGE = 30 // 一頁30個user
const friendsList = JSON.parse(localStorage.getItem('friendsList'))
let currentPage = 1 // 載入網頁時是1，如果點擊分頁器會重新賦值

// selected nodes
const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const modalTitle = document.querySelector('#user-info-modal-title')
const modalImg = document.querySelector('#user-info-modal-img')
const modalEmail = document.querySelector('#user-info-modal-email')
const modalGender = document.querySelector('#user-info-modal-gender')
const modalAge = document.querySelector('#user-info-modal-age')
const modalRegion = document.querySelector('#user-info-modal-region')
const modalBD = document.querySelector('#user-info-modal-birthday')
// selected nodes

// function
function renderDataPanel(data) {
  let rawHTML = ''
  for (let eachUser of data) {
    rawHTML += `
      <div class="col-sm-4 col-md-3 col-lg-2 mb-2">
        <div class="card"> 
          <img src="${eachUser.avatar}" type="button" class="card-img-top btn" data-bs-toggle="modal" data-bs-target="#user-info-modal" data-id="${eachUser.id}" alt="avatar">
          <div class="card-body">
            <h5 class="card-title text-center">${eachUser.name} ${eachUser.surname}</h5>
          </div>
          <div class="card-body text-end dropend">
            <button type="button" class="btn" data-bs-toggle="dropdown" aria-expanded="false"><i class="fa-solid fa-ellipsis"></i></button>
            <ul class="dropdown-menu">
              <li><a class="btn dropdown-item text-danger a-remove-friend" data-id="${eachUser.id}">remove ${eachUser.name + ' ' + eachUser.surname} from friends</a></li>
            </ul>
          </div>
        </div>
      </div>
    `
  }
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(arrLength) {
  const numOfPageItems = Math.ceil(arrLength / USERS_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numOfPageItems; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function renderUserInfoModal(id) {
  const data = filteredFriendsList.length ? filteredFriendsList : friendsList
  const foundUser = data.find(eachUser => eachUser.id === id)
  modalTitle.textContent = foundUser.name + ' ' + foundUser.surname
  modalImg.src = foundUser.avatar
  modalEmail.textContent = foundUser.email
  modalGender.textContent = foundUser.gender
  modalAge.textContent = foundUser.age
  modalRegion.textContent = foundUser.region
  modalBD.textContent = foundUser.birthday
}

function getUserByPage(page) {
  // page 1: 0~29
  // page 2: 30~59
  const data = filteredFriendsList.length ? filteredFriendsList : friendsList
  const firstUser = (page - 1) * USERS_PER_PAGE
  const lastUser = page * USERS_PER_PAGE
  return data.slice(firstUser, lastUser) // 一次30 users, 根據page決定是哪30個
}
// function

// eventListeners
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.card-img-top')) {
    // 如果按的是照片
    const userID = parseInt(event.target.dataset.id) // 取得點擊的頭像的data-id的值，用userID這個變數存起來。
    renderUserInfoModal(userID) // 根據userID取得正確的資料渲染modal
  } else if (event.target.matches('.a-remove-friend')) {
    // 如果點到的是移除好友的dropdown item
    const userID = parseInt(event.target.dataset.id)
    const removeIndex = friendsList.findIndex(eachUser => eachUser.id === userID)
    friendsList.splice(removeIndex, 1)
    if (filteredFriendsList.length) {
      // 如果filteredFriendsList.length轉成boolean值是true，代表有資料在裡面，代表有執行過搜尋
      const removeIndex = filteredFriendsList.findIndex(eachUser => eachUser.id === userID)
      filteredFriendsList.splice(removeIndex, 1)
      // 如果是搜尋過後執行刪除，該筆資料也要從filteredFriendsList移除。
    }
    localStorage.setItem('friendsList', JSON.stringify(friendsList))
    if (currentPage !== 1 && !getUserByPage(currentPage).length) {
      currentPage -= 1
    }
    /**
     * 改善使用者體驗
     * 沒有加這一段的時候，如果目前的頁數是最後一頁，刪除完這一頁的好友後，必須要自己按分頁器才能回到指定的頁數。
     * 加了這一段之後，如果目前的頁數是最後一頁，刪除玩這一頁的好友後，會自己render前一頁的畫面
     */


    renderDataPanel(getUserByPage(currentPage))
    renderPaginator(filteredFriendsList.length ? filteredFriendsList.length : friendsList.length)
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName.toLowerCase() !== 'a') return // 不是點在各個page item上就不執行函式了
  const clickedPage = parseInt(event.target.dataset.page) // 點擊的頁碼
  currentPage = clickedPage // 為currentPage重新賦值
  renderDataPanel(getUserByPage(clickedPage)) // 根據頁碼重新渲染畫面
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.toLowerCase().trim() // 搜尋框鍵入的內容
  filteredFriendsList = friendsList.filter(eachUser => {
    const name = eachUser.name + ' ' + eachUser.surname // 把名字完整組合起來
    if (name.toLowerCase().includes(keyword)) {
      return true // 與關鍵字吻合的結果回傳true
    }
  })
  if (!filteredFriendsList.length) {
    return alert('no such User found.')
  }
  currentPage = 1 // render前先把currentPage設為1
  renderDataPanel(getUserByPage(currentPage)) // 搜尋結果的第一頁
  renderPaginator(filteredFriendsList.length) // 分頁器渲染成搜尋結果的分頁器
})

// eventListeners

renderDataPanel(getUserByPage(currentPage)) // 初始畫面render，用的是friendsList
renderPaginator(friendsList.length) // 根據friendsList的資料數量去render的paginator