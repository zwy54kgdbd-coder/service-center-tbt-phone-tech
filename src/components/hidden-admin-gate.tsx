"use client";

import Image from "next/image";
import { FormEvent, useRef, useState } from "react";
import { Eye, EyeOff, Lock, X } from "lucide-react";

type HiddenAdminGateProps = {
  logo: string;
  brand: string;
};

export function HiddenAdminGate({ logo, brand }: HiddenAdminGateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAccessCodeVisible, setIsAccessCodeVisible] = useState(false);
  const tapCount = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleHiddenTap() {
    tapCount.current += 1;

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 900);

    if (tapCount.current >= 3) {
      tapCount.current = 0;
      setError("");
      setIsOpen(true);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, accessCode })
    });

    setIsLoading(false);

    if (!response.ok) {
      setError("Identifiant ou code incorrect.");
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <>
      <button
        className="brand brand-hidden-trigger"
        type="button"
        onClick={handleHiddenTap}
        aria-label="SERVICE CENTER TBT PHONE TECH accueil"
      >
        <Image src={logo} alt="" width={52} height={52} priority />
        <span>{brand}</span>
      </button>

      {isOpen ? (
        <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-title">
          <div className="admin-modal-panel">
            <button className="admin-close" type="button" onClick={() => setIsOpen(false)} aria-label="Fermer">
              <X size={18} />
            </button>
            <div className="admin-modal-icon">
              <Lock size={24} />
            </div>
            <h2 id="admin-title">Acces prive</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Identifiant
                <input
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </label>
              <label>
                Code d&apos;acces
                <span className="password-field">
                  <input
                    autoComplete="current-password"
                    type={isAccessCodeVisible ? "text" : "password"}
                    value={accessCode}
                    onChange={(event) => setAccessCode(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setIsAccessCodeVisible((isVisible) => !isVisible)}
                    aria-label={isAccessCodeVisible ? "Masquer le code" : "Afficher le code"}
                  >
                    {isAccessCodeVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>
              {error ? <p className="admin-error">{error}</p> : null}
              <button className="button primary" type="submit" disabled={isLoading}>
                {isLoading ? "Connexion..." : "Entrer"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
