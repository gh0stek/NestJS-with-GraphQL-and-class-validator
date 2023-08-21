import * as argon2 from 'argon2'
import * as crypto from 'crypto'

const hashingConfig = {
  // based on OWASP cheat sheet recommendations (as of March, 2022)
  parallelism: 1,
  memoryCost: 64000, // 64 mb
  timeCost: 3, // number of itetations
}

export const hashText = async (password: string) => {
  const salt = crypto.randomBytes(16)
  return argon2.hash(password, {
    ...hashingConfig,
    salt,
  })
}

export const verifyTextWithHash = async (text: string, hash: string) => {
  return argon2.verify(hash, text, hashingConfig)
}
