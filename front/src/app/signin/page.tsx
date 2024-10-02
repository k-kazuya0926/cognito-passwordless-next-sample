'use client'
import { useState } from 'react'
import { usePasswordless } from 'amazon-cognito-passwordless-auth/react'
import Link from 'next/link'
import MyButton from '../../components/UI/MyButton'
import Input from '../../components/UI/InputText'
import styles from './signin.module.css'
import AuthService from '../../services/AuthService'
import { useRouter } from 'next/navigation'

export default function Home (): JSX.Element {
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [sendRequest, setSendRequest] = useState(false)
  const { authenticateWithFido2 } = usePasswordless()
  const router = useRouter()

  async function signinWithPasskey (): Promise<void> {
    try {
      const result = authenticateWithFido2()
      await result.signedIn
    } catch (e) {
      if (e instanceof Error) {
        console.log(e)
      }
    }
  }

  async function signinWithOneTimeCode (): Promise<void> {
    setSendRequest(true)
    try {
      await AuthService.signIn(email)
      await AuthService.answerCustomChallenge('dummy') // signInMethodを送るためにダミーの回答をする
      router.push('/answerChallenge')
    } catch (e) {
      console.log(e)
      // @ts-ignore
      setErrorMessage(e.message)
      setSendRequest(false)
    }
  }

  return (
      <div className={styles.container}>
        <h1>ログイン</h1>
        <div className={styles.outline}>
          {(
              <>
                <h2>生体認証でログイン</h2>
                <div>
                  <p>デバイスの生体認証でログインします。</p>
                </div>
                <div>
                  <MyButton
                      onClickButton={() => { signinWithPasskey().catch((e) => { console.log(e) }) }}
                      color='primary'
                      disabled={sendRequest}
                  >生体認証ログイン
                  </MyButton>
                </div>

                <div>
                  <hr className={styles.horizonalRule} />
                </div>

                <div className={styles.mailForm}>
                  <h2>メールアドレスでログイン</h2>
                  <div>
                    <p>メールアドレスでログインします。</p>
                    <p>入力したメールアドレスにメッセージが届きます。</p>
                  </div>
                  {errorMessage !== '' &&
                      <div className={styles.errorWindow}>
                        <p>
                          {errorMessage}
                        </p>
                      </div>
                  }
                  <Input
                      inputId='email'
                      value={email}
                      onValueChange={(e) => { setEmail(e.target.value) }}
                      label=''
                      name='email'
                      type='email'
                      placeholder='メールアドレス'
                  />
                  <MyButton
                      onClickButton={() => { signinWithOneTimeCode().catch((e) => { console.log(e) }) } }
                      color='primary'
                      disabled={sendRequest}
                  >メールアドレスログイン</MyButton>
                </div>

                <div>
                  <hr className={styles.horizonalRule} />
                </div>

                <div className={styles.link}>
                  <span style={{ marginRight: '0.25rem' }}>または</span>
                  <Link href="/signup">
                    会員登録
                  </Link>
                </div>
              </>)}
        </div>
      </div>
  )
}
