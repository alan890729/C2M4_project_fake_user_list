// url
const BASE_URL = 'https://user-list.alphacamp.io/'
const INDEX_URL = BASE_URL + 'api/v1/users/' // get all the user info by using INDEX_URL, or get a specific user info by adding a id number at the bottom of INDEX_URL, ex: INDEX_URL + 1
// url

const userData = [] // all user info stored here
let filteredUserData = [] // 經過搜尋框鍵入的關鍵字篩選後的userData
const USERS_PER_PAGE = 30 // 一頁30個user

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
          <div class="card-body text-center"><a type="button" class="btn btn-primary btn-add-friend" data-id="${eachUser.id}">add friend</a></div>
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
  modalTitle.textContent = ''
  modalImg.src = ''
  modalEmail.textContent = ''
  modalGender.textContent = ''
  modalAge.textContent = ''
  modalRegion.textContent = ''
  modalBD.textContent = ''
  axios.get(INDEX_URL + id).then(function (response) {
    const eachUserData = response.data

    modalTitle.textContent = eachUserData.name + ' ' + eachUserData.surname
    modalImg.src = eachUserData.avatar
    modalEmail.textContent = eachUserData.email
    modalGender.textContent = eachUserData.gender
    modalAge.textContent = eachUserData.age
    modalRegion.textContent = eachUserData.region
    modalBD.textContent = eachUserData.birthday
  }).catch(function (error) {
    console.log(error)
  })
}

function getUserByPage(page) {
  // page 1: 0~29
  // page 2: 30~59
  const data = filteredUserData.length ? filteredUserData : userData
  const firstUser = (page - 1) * USERS_PER_PAGE
  const lastUser = page * USERS_PER_PAGE // 最後一個user的index再加1才會取到最後一個user
  return data.slice(firstUser, lastUser) // 一次30 users, 根據page決定是哪30個
}
// function

// eventListeners
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.card-img-top')) {
    // 如果按的是照片
    const userID = event.target.dataset.id // 取得點擊的頭像的data-id的值，用userID這個變數存起來。
    renderUserInfoModal(userID) // 根據userID取得正確的資料渲染modal
  } else if (event.target.matches('.btn-add-friend')) {
    // 如果按的是加好友按鈕
    // console.log(event)
    const friendsList = JSON.parse(localStorage.getItem('friendsList')) || []
    const data = filteredUserData.length ? filteredUserData : userData
    userID = parseInt(event.target.dataset.id) // 取得dataset的id的資料
    if (friendsList.some(eachUser => eachUser.id === userID)) {
      return alert('已加過此人為好友，ㄜ，我是說機器人')
    }
    /**
     * 這一步是確保不要重複加到好友。
     * 在取得userID後，先去跟friendsList的資料比對有沒有重複的id。
     * 有的話代表之前有加過這個user好友。
     * 中斷function，並用一個警告訊息提醒操作者
     */
    user = data.find(eachUser => eachUser.id === userID)
    /**
     * data無論是filteredUserData或userData，陣列中的每筆資料都自帶獨一無二的id
     * 指定要遍歷的陣列中，如果當前元素的id與dataset.id吻合，
     * cb func回傳true->find()回傳當前元素（某筆資料）、停止遍歷
     * user接住結果
     */

    friendsList.push(user) // 把user push到friendsList
    localStorage.setItem('friendsList', JSON.stringify(friendsList))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName.toLowerCase() !== 'a') return // 不是點在各個page item上就不執行函式了
  const clickedPage = parseInt(event.target.dataset.page) // 點擊的頁碼
  renderDataPanel(getUserByPage(clickedPage)) // 根據頁碼重新渲染畫面
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.toLowerCase().trim() // 搜尋框鍵入的內容
  filteredUserData = userData.filter(eachUser => {
    const name = eachUser.name + ' ' + eachUser.surname // 把名字完整組合起來
    if (name.toLowerCase().includes(keyword)) {
      return true // 與關鍵字吻合的結果回傳true
    }
  })
  if (!filteredUserData.length) {
    return alert('no such User found.')
  }
  renderDataPanel(getUserByPage(1)) // 搜尋結果的第一頁
  renderPaginator(filteredUserData.length) // 分頁器渲染成搜尋結果的分頁器
})

// eventListeners

// get all the user's images, Name, Surname, and render the page by using innerHTML
axios.get(INDEX_URL).then(function (response) {
  let userDataTemp = response.data.results.filter(eachUser => eachUser.avatar !== null)
  /* get資料後(response.data.results)，把第200筆資料篩掉，因為沒有照片
   * 用一個變數userDataTemp接住filter後的資料陣列
  */
  userData.push(...userDataTemp) // 用全域變數userData存放userDataTemp

  // render page
  renderDataPanel(getUserByPage(1)) // 載入網頁時always顯示第一頁
  renderPaginator(userData.length) // 根據userData的length渲染paginator

}).catch(function (error) {
  console.log(error)
})