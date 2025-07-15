"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type AuthResult =
  | { code: "missing-fields" }
  | { code: "user-not-exist" }
  | { code: "password-wrong" }
  | { code: "login-success"; redirectTo: string }
  | { code: "user-already-exist" }
  | { code: "register-success" }
  | { code: "no-permission" }
  | { code?: string }

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleAuthResponse = (data: AuthResult) => {
    const code = data?.code ?? ""

    if (!code) {
      alert("Unexpected error. Please try again.")
      return
    }

    switch (code) {
      case "missing-fields":
        alert("Username or password missing.")
        break

      case "user-not-exist":
        alert("ERROR: User does not exist.")
        break

      case "password-wrong":
        alert("ERROR: Password is incorrect.")
        break

      case "user-already-exist":
        alert("User already exists.")
        break

      case "no-permission":
        alert("You don’t have permission to access that page.")
        router.push("/")
        break

      case "register-success":
        alert("Registered successfully. Logging in...")
        handleLogin() // ⬅ 註冊成功自動登入
        break

      case "login-success":
        alert("Login successful. Redirecting…")
        if (data.redirectTo && router.pathname !== data.redirectTo) {
          router.push(data.redirectTo);
        }
        break

      default:
        alert("Unexpected error code: " + code)
    }
  }

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/login_logout_and_register/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = (await res.json()) as AuthResult
      handleAuthResponse(data)
    } catch {
      alert("Network error during login.")
    }
  }

  const handleRegister = async () => {
    try {
      const res = await fetch("/api/login_logout_and_register/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = (await res.json()) as AuthResult
      handleAuthResponse(data)
    } catch {
      alert("Network error during registration.")
    }
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Data Center Management</h2>

      <input
        type="text"
        placeholder="Username"
        className="w-full mb-3 p-2 border rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full mb-3 p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex justify-between">
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </button>
        <button onClick={handleRegister} className="bg-gray-500 text-white px-4 py-2 rounded">
          Register
        </button>
      </div>
    </div>
  )
}

