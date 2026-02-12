import { useState } from "react";
import { setPassword } from "../api/user.api";

export default function SetPassword({ onSuccess }) {
  const [password, setPasswordValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (password !== confirm) {
      setError("As senhas não coincidem");
      return;
    }

    try {
      setLoading(true);
      await setPassword({ password });
      onSuccess?.();
    } catch (err) {
      setError("Erro ao definir senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Definir Senha</h2>

      <input
        type="password"
        placeholder="Nova senha"
        value={password}
        onChange={e => setPasswordValue(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Confirmar senha"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        required
      />

      {error && <small style={{ color: "red" }}>{error}</small>}

      <button disabled={loading}>
        {loading ? "Salvando..." : "Salvar senha"}
      </button>
    </form>
  );
}

const styles = {
  form: {
    maxWidth: 400,
    margin: "40px auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};
