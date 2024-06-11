export class GithubUser {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`

    return fetch(endpoint)
    .then(data => data.json())
    .then(({ login, name, public_repos, followers }) => ({
      login,
      name,
      public_repos,
      followers
    }))
  }
}

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@gitfavs')) || []
  }

  save() {
    localStorage.setItem('@gitfavs', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const existUser = this.entries.find(entry => entry.login.toLowerCase() === username.toLowerCase())
      if(existUser) {
        throw new Error('Usuário existente!')
        return
      }

      const user = await GithubUser.search(username)

      if(user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }


      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch(error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

    console.log(filteredEntries)

    this.entries = filteredEntries

    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = document.querySelector('table tbody')

    this.update()
    this.onAdd()
  }

  update() {
    this.removeAllRow()

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.login}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = `${user.name}`
      row.querySelector('.user span').textContent = `/${user.login}`
      row.querySelector('.repo').textContent = `${user.public_repos}`
      row.querySelector('.followers').textContent = `${user.followers}`

      row.querySelector('.action').onclick = () => {
        const confirmRemoveMsg = confirm('Deseja apagar o usuário?')
        if (confirmRemoveMsg) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
    
    //Se não tem algum <tr> dentro do <tbody>, entra aqui
    if(!this.tbody.querySelector('tr')) {
      this.tbody.classList.add('empty')
    }

    if(this.tbody.querySelector('tr')) {
      this.tbody.classList.remove('empty')
    }
  }

  onAdd() {
    const addButton = this.root.querySelector('.search button')

    addButton.onclick = (e) => {
      e.preventDefault()

      const { value } = this.root.querySelector('.search input')
      this.add(value)

      this.root.querySelector('.search').reset()
    }
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <tr>
        <td class="user">
          <img src="https://github.com/ishugodev.png" alt="">
          <a href="">
            <p>Hugo Ishimoto</p>
            <span>/ishugodev</span>
          </a>
        </td>
        <td class="repo"></td>
        <td class="followers"></td>
        <td class="action">Remover</td>
      </tr>
    `

    return tr
  }

  removeAllRow() {
    this.tbody.querySelectorAll('tr').forEach(tr => tr.remove())
  }
}