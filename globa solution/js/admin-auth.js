const DEMO_ADMINS = [
  { code: "ZEL-001", password: "Bairro123", name: "Zeladoria 01" },
  { code: "ZEL-002", password: "Bairro456", name: "Zeladoria 02" }
];
const ADMIN_SESSION_KEY = "zeladoria-demo-admin";
const loginForm = document.querySelector("#login-form");
const loginSection = document.querySelector("#login-section");
const adminContent = document.querySelector("#admin-content");
const loginMessage = document.querySelector("#login-message");
const adminCodeInput = document.querySelector("#admin-code");
const passwordInput = document.querySelector("#admin-password");
const sessionName = document.querySelector("#admin-session-name");
const logoutButton = document.querySelector("#logout-button");

function showAdmin(admin) {
  loginSection.hidden = true;
  adminContent.hidden = false;
  sessionName.textContent = `Sessão demonstrativa: ${admin.name}`;
}

function restoreDemoSession() {
  try {
    const savedCode = sessionStorage.getItem(ADMIN_SESSION_KEY);
    const admin = DEMO_ADMINS.find((entry) => entry.code === savedCode);
    if (admin) {
      showAdmin(admin);
    }
  } catch (error) {
    console.error("Não foi possível restaurar a sessão demonstrativa:", error);
    loginMessage.textContent = "Não foi possível restaurar a sessão. Entre novamente.";
  }
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const code = adminCodeInput.value.trim().toLocaleUpperCase("pt-BR");
  const password = passwordInput.value;
  const admin = DEMO_ADMINS.find(
    (entry) => entry.code === code && entry.password === password
  );

  if (!admin) {
    loginMessage.textContent = "Código ou senha incorretos. Confira os dados e tente novamente.";
    passwordInput.value = "";
    passwordInput.focus();
    return;
  }

  try {
    sessionStorage.setItem(ADMIN_SESSION_KEY, admin.code);
    loginMessage.textContent = "";
    passwordInput.value = "";
    showAdmin(admin);
    document.querySelector("#page-title").focus();
  } catch (error) {
    console.error("Não foi possível iniciar a sessão demonstrativa:", error);
    loginMessage.textContent = "Não foi possível iniciar a sessão neste navegador.";
  }
});

logoutButton.addEventListener("click", () => {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    adminContent.hidden = true;
    loginSection.hidden = false;
    loginForm.reset();
    loginMessage.textContent = "Você saiu da área da zeladoria.";
    adminCodeInput.focus();
  } catch (error) {
    console.error("Não foi possível encerrar a sessão demonstrativa:", error);
    loginMessage.textContent = "Não foi possível encerrar a sessão neste navegador.";
  }
});

restoreDemoSession();
