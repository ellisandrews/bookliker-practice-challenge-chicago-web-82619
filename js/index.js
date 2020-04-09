// API base
const BASE_URL = 'http://localhost:3000'

// Helper functions for fetch requests
const parseJSONResponse = response => response.json()
const logError = error => console.log(error)

// Make a <p> tag for given user that has liked a book
const makeUserLikeTag = (user) => {
    const p = document.createElement('p')
    const b = document.createElement('b')
    b.innerText = user.username
    p.appendChild(b)
    return p
}

// Construct a show panel div for a given book
const makeBookPanel = book => {
    const div = document.createElement('div')

    // Fixed attributes
    const h3 = document.createElement('h3')
    h3.innerText = book.title

    const img = document.createElement('img')
    img.src = book.img_url

    const pDesc = document.createElement('p')
    pDesc.innerText = book.description

    const button = document.createElement('button')
    button.innerText = 'Like Book'

    // Dynamic attributes (user likes)
    const likerDiv = document.createElement('div')
    likerDiv.id = `likers-book-${book.id}`
    book.users.forEach(user => {
        const pUser = makeUserLikeTag(user)
        likerDiv.appendChild(pUser)
    })

    // Add all constructed child tags to the book <div>
    const divChildTags = [h3, img, pDesc, likerDiv, button]
    divChildTags.forEach(tag => div.appendChild(tag))

    div.id = `book-${book.id}`
    div.name = `book-${book.id}`
    div.style.display = 'none'  // Hidden by default

    return div
}

// Create a <li> tag for a given book
const makeBookListItem = book => {
    const li = document.createElement('li')
    li.innerText = book.title
    li.dataset.bookId = book.id
    return li
}

// Create skeleton HTML for books on the page
const displayBooks = (books) => {
    const ul = document.querySelector('#list')
    const showPanel = document.querySelector('#show-panel')

    // For each book: 
    //   1) Make a <li>Title<li> under the <ul>
    //   2) Make a hidden <div> under <div id="show-panel"> 
    books.forEach(book => {
        // Add to the list
        ul.appendChild(makeBookListItem(book))
        
        // Make book side panel (hidden) 
        showPanel.appendChild(makeBookPanel(book))
    })

}

// Show a cicked book in the book display panel
const toggleBookDisplay = (bookId) => {
    // Toggle all panels to hidden
    const showPanel = document.querySelector('#show-panel')
    const bookDivs = showPanel.querySelectorAll('div[id^=book-]')
    bookDivs.forEach(bookDiv => bookDiv.style.display = 'none')
    
    // Toggle the clicked book panel to displayed
    const displayedBookDiv = showPanel.querySelector(`div#book-${bookId}`)
    displayedBookDiv.style.display = 'block'
}

// Update backend and then frontend for a newly liked book
const likeBookUpdate = async (bookId, user) => {

    // Fetch the current users for the book
    let likingUsers = await fetch(BASE_URL + `/books/${bookId}`)
                            .then(parseJSONResponse)
                            .then(book => book.users)
                            .catch(logError)

    // Users are only allowed to like a book once
    if (likingUsers.find(likingUser => likingUser.id === user.id)) {
        alert('You already liked this book!')
        return
    }

    // Make a patch request to the backend
    reqObj = {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            users: [...likingUsers, user]
        })
    }

    // Update the backend then the frontend
    fetch(BASE_URL + `/books/${bookId}`, reqObj)
        .then(parseJSONResponse)
        .then(book => {
            // Add the user to the div of p tags of likers
            const likerDiv = document.querySelector(`#likers-book-${book.id}`)
            const pUser = makeUserLikeTag(user)
            likerDiv.appendChild(pUser)
        })
        .catch(logError)
}

// Event listner callback functions
const handleListPanelClick = (event) => {
    const target = event.target
    
    // Only act on clicks on the book <li>s
    if (target.matches('li')) {
        toggleBookDisplay(target.dataset.bookId)
    }
}

const handleShowPanelClick = async (event) => {
    const target = event.target
    
    // Only act on clicks on "Like Book" <button>s
    if (target.matches('button')) {

        // Get the book ID that was liked
        const bookDiv = target.parentElement
        bookId = parseInt(bookDiv.id.split('-')[1])

        // Get the user doing the liking (hard coded for now)
        user = await fetch(BASE_URL + '/users/1')
                        .then(parseJSONResponse)
                        .catch(logError)

        // Update the backend then (conditionally) the frontend
        likeBookUpdate(bookId, user)
    }
}


// Event listeners for clicks
const addListPanelClickListener = () => {
    const listPanel = document.querySelector('#list-panel')
    listPanel.addEventListener('click', handleListPanelClick)
}

const addShowPanelClickListener = () => {
    const showPanel = document.querySelector('#show-panel')
    showPanel.addEventListener('click', handleShowPanelClick)
}


// Method for fetching and displaying books on the page
const fetchBooks = () => {
    fetch(BASE_URL + '/books')
        .then(parseJSONResponse)
        .then(displayBooks)
        .catch(logError)
}

// Collect exuction in main function
const main = () => {
    fetchBooks()
    addListPanelClickListener()
    addShowPanelClickListener()
}

// Execute main
main()
