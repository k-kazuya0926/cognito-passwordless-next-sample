'use client'
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import AuthService from '../../services/AuthService'
import { useRouter } from 'next/navigation'

export default function Home (): JSX.Element {
    const [digit1, setDigit1] = useState<string>('');
    const [digit2, setDigit2] = useState<string>('');
    const [digit3, setDigit3] = useState<string>('');
    const [digit4, setDigit4] = useState<string>('');
    const [digit5, setDigit5] = useState<string>('');
    const [digit6, setDigit6] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [busy, setBusy] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const router = useRouter();

    const digit1Ref = useRef<HTMLInputElement>(null);
    const digit2Ref = useRef<HTMLInputElement>(null);
    const digit3Ref = useRef<HTMLInputElement>(null);
    const digit4Ref = useRef<HTMLInputElement>(null);
    const digit5Ref = useRef<HTMLInputElement>(null);
    const digit6Ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const param = AuthService.getPublicChallengeParameters();
        if (param) {
          setEmail(param.email);
        } else {
          setEmail('your address')
        }
    }, []);

    useEffect(() => {
        // 各桁の入力フィールドの自動フォーカス
        const refs = [digit1Ref, digit2Ref, digit3Ref, digit4Ref, digit5Ref, digit6Ref];
        const digits = [digit1, digit2, digit3, digit4, digit5];

        digits.forEach((digit, index) => {
            if (digit && refs[index + 1]?.current) {
                refs[index + 1].current?.focus();
            }
        });
    }, [digit1, digit2, digit3, digit4, digit5]);

    const handleDigit1Change = (value: string) => {
        if (value.length > 1) {
            const digits = value.split('').slice(0, 6);
            setDigit1(digits[0]);
            setDigit2(digits[1]);
            setDigit3(digits[2]);
            setDigit4(digits[3]);
            setDigit5(digits[4]);
            setDigit6(digits[5]);
        } else {
            setDigit1(value);
        }
    };

    const handleSubmit = async () => {
        try {
            setErrorMessage('');
            setBusy(true);
            const answer = [digit1, digit2, digit3, digit4, digit5, digit6].join('');
            const loginSucceeded = await AuthService.answerCustomChallenge(answer);
            if (loginSucceeded) {
                router.push('/')
            } else {
                setErrorMessage('That\'s not the right code');
            }
        } catch (err: any) {
            setErrorMessage(err.message || err.toString());
        } finally {
            setBusy(false);
        }
    };

    const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2>Complete Sign-In</h2>
                <p>Please enter the secret sign-in code that was sent to {email} to complete sign-in</p>
            </div>
            <div className="card-body">
                <div className="form">
                    <input
                        type="tel"
                        maxLength={1}
                        pattern="\d*"
                        value={digit1}
                        ref={digit1Ref}
                        onChange={(e) => handleDigit1Change(e.target.value)}
                    />
                    {[digit2, digit3, digit4, digit5, digit6].map((digit, index) => (
                        <input
                            key={index}
                            type="tel"
                            maxLength={1}
                            pattern="\d*"
                            value={digit}
                            ref={[digit2Ref, digit3Ref, digit4Ref, digit5Ref, digit6Ref][index]}
                            onChange={handleChange([setDigit2, setDigit3, setDigit4, setDigit5, setDigit6][index])}
                        />
                    ))}
                </div>
            </div>
            <div className="card-footer">
                <button onClick={handleSubmit} disabled={busy}>
                    {busy ? 'Loading...' : 'Continue'}
                </button>
                {errorMessage && <p>{errorMessage}</p>}
            </div>
        </div>
    );
};
