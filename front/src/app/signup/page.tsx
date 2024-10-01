'use client'
import { useState } from 'react'
import { generatePassword } from '@/libs/Utils'
import Link from 'next/link'
import MyButton from '../../components/UI/MyButton'
import Input from '../../components/UI/InputText'
import styles from './signup.module.css'
import AuthService from '../../services/AuthService'
import { useRouter } from 'next/navigation'

export default function Home (): JSX.Element {
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [sendRequest, setSendRequest] = useState(false)
  const router = useRouter()

  async function signup (): Promise<void> {
    setSendRequest(true)
    try {
      await AuthService.signUp(email, generatePassword())
      await AuthService.signIn(email)
      await AuthService.answerCustomChallenge('dummy')
      router.push('/answerChallenge')
    } catch (e) {
      console.log(e)
      // @ts-ignore
      setErrorMessage(e.message)
      setSendRequest(false)
    }
  }

  return (
    <div>
        <div className={styles.container}>
          <h1>新規登録</h1>
          <div className={styles.outline}>
            {(
              <>
                <h2>メールで新規登録</h2>
                <div>
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
                  onClickButton={() => {
                    signup().catch((e) => {
                      console.log(e)
                    })
                  }}
                  color='primary'
                  disabled={sendRequest}
                >新規登録</MyButton>

                <div>
                  <hr className={styles.horizonalRule} />
                </div>

                <div className={styles.link}>
                  <span style={{ marginRight: '0.25rem' }}>または</span>
                  <Link href="/signin">
                    ログイン
                  </Link>
                </div>
              </>)
            }
          </div>
        </div>
      </div>
  )
}
