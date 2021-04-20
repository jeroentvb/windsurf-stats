import { Request, Response } from 'express'
import { User } from '../../../../shared/interfaces/User'
import userService from './user.service'
import auth from '../../services/auth'

async function register (req: Request, res: Response) {
  try {
    const user: User = req.body

    if (process.env.ALLOW_REGISTER === 'false') {
      res.status(403).send()
      return
    }
  
    if (!user.email || !user.password || !user.name) {
      res.status(422).send('Missing username, email or password')
      return
    }

    await userService.addUser(user)

    req.session!.user = {
      name: user.name,
      email: user.email
    }

    res.send()
  } catch (err) {
    if (err === 409) {
      res.status(409).send('Username or email is already used')
      return
    }

    console.error(err)
    res.status(500).send()
  }
}

async function login (req: Request, res: Response) {
  try {
    const user: User = req.body

    if (!user.name || !user.password) {
      res.status(422).send('Missing username or password')
      return
    }

    const correctPassword = await auth.verifyPassword(user)

    if (!correctPassword) {
      res.status(401).send('Incorrect username or password')
      return
    }

    req.session!.user = {
      name: user.name,
      email: user.email
    }

    res.status(200).send()
  } catch (err) {
    if (err === 422) {
      res.status(422).send('Missing username or password')
      return
    }

    console.error(err)
    res.status(500).send()
  }
}

function logout (req: Request, res: Response) {
  req.session!.destroy(err => {
    if (err) {
      console.error(err)
      res.status(500).send()
      return
    }
    
    res.send()
  })
}

async function updateEmail (req: Request, res: Response) {  
  try {
    const { email, password }: { email: string, password: string } = req.body
    const { name }: User = req.session!.user

    await userService.setEmail(name, email, password)

    req.session!.user.email = email

    res.send('OK')
  } catch (err) {
    if (err === 401) {
      res.status(401).send('Incorrect password')
      return
    } else if (err === 409) {
      res.status(409).send('E-mail address is not in the correct format, or already taken')
      return
    }

    console.error(err)
    res.status(500).send()
  }
}

export default {
  register,
  login,
  logout,
  updateEmail
}
