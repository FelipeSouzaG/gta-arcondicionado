import {
  closeModal,
  closeModalRegister,
  exitSession,
  openSession,
  showModalAlert,
} from '../scripts/modals.js';
import {
  userDelete,
  userLogin,
  userLogoff,
  userRegister,
  userSection,
  userUpdate,
} from '../scripts/fetch.js';
import {
  formatName,
  formatPhoneInput,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '../scripts/validation.js';
import {
  formGroupPhone,
  formGroupPerson,
  formGroupMail,
  formGroupEye,
  formGroupEyeSlash,
} from '../scripts/icons.js';

export async function showModalLogin() {
  const modal = document.getElementById('modal-register');
  const title = document.getElementById('modal-register-title');
  const content = document.getElementById('modal-register-main');
  const btnClose = document.getElementById('close-register');
  const footer = document.getElementById('modal-register-footer');

  title.textContent = 'Iniciar Sessão';
  content.innerHTML = `
    <form id="formLogin" class="form">  
      <div class="form-group">
        <input class="form-group-input" type="text" id="email" name="email" autocomplete="username" required>
        <label class="form-group-label" for="">E-mail:</label>
        ${formGroupMail}
      </div>
      <div class="form-group">
        <input class="form-group-input" type="password" id="password" class="icon-input"  name="password" autocomplete="current-password" required>
        <label class="form-group-label" for="">Senha:</label>
        <button type="button" id="togglePassword">
          ${formGroupEye}
        </button>
      </div>
      <button id="submit" class="modal-content-btn-enter"> Entrar </button> 
    </form>
  `;

  footer.innerHTML = `
    <div class="modal-user-footer">
      <button id="register" class="modal-content-btn-enable">Registre-se</button>
    </div>
  `;

  btnClose.onclick = function () {
    closeModalRegister();
  };

  modal.style.display = 'block';

  const passwordInput = document.getElementById('password');
  const togglePasswordButton = document.getElementById('togglePassword');

  togglePasswordButton.addEventListener('click', () => {
    const type =
      passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordButton.innerHTML =
      type === 'password' ? formGroupEye : formGroupEyeSlash;
  });

  const form = document.getElementById('formLogin');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const dataLogin = {};

    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    if (email === '') {
      showModalAlert('Alert', 'E-mail!!', 'Digite seu e-mail', closeModal);
      return;
    }

    if (password === '') {
      showModalAlert('Alert', 'Senha!!', 'Digite a senha', closeModal);
      return;
    }

    if (!validateEmail(email) || !validatePassword(password)) {
      showModalAlert(
        'Alert',
        'Login Inválido',
        'E-mail ou Senha inválido!',
        closeModal
      );
      return;
    }

    dataLogin.email = email;
    dataLogin.password = password;

    try {
      const userData = await userLogin(dataLogin);
      if (userData.redirectUrl) {
        window.location.href = userData.redirectUrl;
      } else if (userData.status === 201) {
        const level = userData.level;
        showModalAlert('Next', userData.title, userData.msg, async () => {
          await openSession(level);
          window.location.href = './client.html';
        });
      } else if (userData.status === 400 || userData.status === 401) {
        showModalAlert('Alert', userData.title, userData.msg, closeModal);
        return;
      }
    } catch (error) {
      showModalAlert('Alert', 'Erro de Conexão!', error, closeModal);
      return;
    }
  });

  const modalRegister = document.getElementById('register');
  modalRegister.addEventListener('click', () => {
    showModalRegister();
  });
}

export async function showModalRegister() {
  const modal = document.getElementById('modal-register');
  const title = document.getElementById('modal-register-title');
  const content = document.getElementById('modal-register-main');
  const btnClose = document.getElementById('close-register');
  const footer = document.getElementById('modal-register-footer');

  title.textContent = 'Registre-se';
  content.innerHTML = `
    <form id="formRegister" class="form">
      <div class="radio-request">
        <label class="label">
          <input type="checkbox" class="checkbox" name="isClient" value="isClient">
          <span class="span">Sou cliente</span>
        </label>
      </div>
      <div id="phoneClient" class="hidden">
        <div class="form-group">
          <input class="form-group-input" type="text" id="phone" name="phone" required maxlength="15">
          <label class="form-group-label" for="">Digite o Telefone:</label>
          ${formGroupPhone}
        </div>
        <div id="phoneHelp" class="requirements hidden"></div>
      </div>
      <div id="nameClient" class="requirements-content">
        <div class="form-group">
          <input class="form-group-input" type="text" id="name" name="name" placeholder="">
          <label class="form-group-label" for="">Nome e Sobrenome:</label>
          ${formGroupPerson}
        </div>
        <div id="nameHelp" class="requirements hidden"></div>
      </div>
      <div class="requirements-content">
        <div class="form-group">
          <input class="form-group-input" type="text" id="email" name="email" autocomplete="username" required>
          <label class="form-group-label" for="">E-mail:</label>
          ${formGroupMail}
        </div>
        <div id="emailHelp" class="requirements hidden"></div>
      </div>
      <div class="requirements-content">
        <div class="form-group">
          <input class="form-group-input" type="password" id="password" class="icon-input"  name="password" autocomplete="new-password" required>
          <label class="form-group-label" for="">Senha:</label>
          <button type="button" id="togglePassword">
          ${formGroupEye}
          </button>
        </div>
        <ul id="passwordRequirements" class="requirements hidden">
          <li class="requirement" data-requirement="length">8 Caracteres</li>
          <li class="requirement" data-requirement="uppercase">Letra Maiúscula</li>
          <li class="requirement" data-requirement="lowercase">Letra Minúscula</li>
          <li class="requirement" data-requirement="number">Número</li>
          <li class="requirement" data-requirement="special">Caractere Especial</li>
        </ul>
      </div>
    </form>
  `;
  footer.innerHTML = `
    <div class="modal-user-footer">
      <button id="submit" class="modal-content-btn-ok">Enviar</button>
    </div>
  `;

  modal.style.display = 'block';

  btnClose.onclick = function () {
    closeModalRegister();
  };

  const checkboxIsClient = document.querySelector('input[name="isClient"]');
  const phoneClientDiv = document.getElementById('phoneClient');
  const nameClientDiv = document.getElementById('nameClient');
  const phoneInput = document.getElementById('phone');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const requirements = document.querySelectorAll('.requirement');
  const requirement = document.getElementById('passwordRequirements');
  const togglePasswordButton = document.getElementById('togglePassword');
  const nameHelp = document.getElementById('nameHelp');
  const emailHelp = document.getElementById('emailHelp');
  const phoneHelp = document.getElementById('phoneHelp');

  const toggleClientFields = () => {
    if (checkboxIsClient.checked) {
      nameClientDiv.classList.remove('requirements-content');
      nameClientDiv.classList.add('hidden');
      nameInput.value = '';
      phoneClientDiv.classList.remove('hidden');
      phoneClientDiv.classList.add('requirements-content');
      nameHelp.classList.remove('requirements');
      nameHelp.classList.add('hidden');
    } else {
      phoneClientDiv.classList.remove('requirements-content');
      phoneClientDiv.classList.add('hidden');
      nameClientDiv.classList.remove('hidden');
      nameClientDiv.classList.add('requirements-content');
      phoneInput.value = '';
      phoneHelp.classList.remove('requirements');
      phoneHelp.classList.add('hidden');
    }
  };

  checkboxIsClient.addEventListener('change', toggleClientFields);

  toggleClientFields();

  formatPhoneInput(phoneInput);

  togglePasswordButton.addEventListener('click', () => {
    const type =
      passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordButton.innerHTML =
      type === 'password' ? formGroupEye : formGroupEyeSlash;
  });

  phoneInput.addEventListener('input', function () {
    const phoneValue = phoneInput.value.trim();
    if (phoneInput.value !== '') {
      phoneHelp.classList.remove('hidden');
    }
    if (validatePhone(phoneValue)) {
      phoneHelp.textContent = 'Telefone válido!';
      phoneHelp.style.color = 'var(--color-valid)';
      phoneInput.classList.add('valid');
      phoneInput.classList.remove('invalid');
    } else {
      phoneHelp.textContent = 'Digite um telefone válido!';
      phoneHelp.style.color = 'var(--color-invalid)';
      phoneInput.classList.add('invalid');
      phoneInput.classList.remove('valid');
    }
  });

  nameInput.addEventListener('input', function () {
    const nameValue = nameInput.value.trim();
    if (nameInput.value !== '') {
      nameHelp.classList.remove('hidden');
    }
    if (validateName(nameValue)) {
      nameHelp.textContent = 'Nome válido!';
      nameHelp.style.color = 'var(--color-valid)';
      nameInput.classList.add('valid');
      nameInput.classList.remove('invalid');
    } else {
      nameHelp.textContent = 'Digite nome e sobrenome.';
      nameHelp.style.color = 'var(--color-invalid)';
      nameInput.classList.add('invalid');
      nameInput.classList.remove('valid');
    }
  });

  nameInput.addEventListener('blur', function () {
    nameInput.value = formatName(nameInput.value);
  });

  emailInput.addEventListener('input', function () {
    const emailValue = emailInput.value.trim();
    if (emailInput.value !== '') {
      emailHelp.classList.remove('hidden');
    }
    if (validateEmail(emailValue)) {
      emailHelp.textContent = 'E-mail válido!';
      emailHelp.style.color = 'var(--color-valid)';
      emailInput.classList.add('valid');
      emailInput.classList.remove('invalid');
    } else {
      emailHelp.textContent = 'Digite um e-mail válido';
      emailHelp.style.color = 'var(--color-invalid)';
      emailInput.classList.add('invalid');
      emailInput.classList.remove('valid');
    }
  });

  function checkPasswordRequirements(password) {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[@$!%*?&#]/.test(password),
    };

    requirements.forEach((requirement) => {
      const key = requirement.dataset.requirement;
      if (checks[key]) {
        requirement.style.color = 'var(--color-valid)';
        requirement.classList.add('valid');
      } else {
        requirement.style.color = 'var(--color-invalid)';
        requirement.classList.remove('valid');
      }
    });
  }

  passwordInput.addEventListener('input', function () {
    if (passwordInput.value !== '') {
      requirement.classList.remove('hidden');
    }

    const password = passwordInput.value;
    checkPasswordRequirements(password);

    if (
      password &&
      Array.from(requirements).every((req) => req.classList.contains('valid'))
    ) {
      passwordInput.classList.add('valid');
      passwordInput.classList.remove('invalid');
    } else {
      passwordInput.classList.add('invalid');
      passwordInput.classList.remove('valid');
    }
  });

  const send = document.getElementById('submit');
  send.addEventListener('click', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value;
    const phone = document.getElementById('phone').value.replace(/\D/g, '');
    const dataSend = {};

    if (checkboxIsClient.checked) {
      if (phone === '') {
        showModalAlert(
          'Alert',
          'Telefone!',
          'Por favor, digite o telefone concedido a empresa.',
          closeModal
        );
        return;
      }

      if (!validatePhone(phone)) {
        showModalAlert(
          'Alert',
          'Telefone inválido!',
          'Por favor, digite um telefone no formato DDD+Número.',
          closeModal
        );
        return;
      }
      dataSend.phone = phone;
    } else {
      if (name === '') {
        showModalAlert(
          'Alert',
          'Nome e Sobrenome!',
          'Por favor, digite seu Nome.',
          closeModal
        );
        return;
      }

      if (!validateName(name)) {
        showModalAlert(
          'Alert',
          'Nome Inválido!',
          'Por favor, digite seu nome e sobrenome.',
          closeModal
        );
        return;
      }
      dataSend.name = name;
    }

    if (email === '') {
      showModalAlert(
        'Alert',
        'E-mail!',
        'Por favor, digite seu e-mail.',
        closeModal
      );
      return;
    }
    if (!validateEmail(email)) {
      showModalAlert(
        'Alert',
        'E-mail inválido!',
        'E-mail informado inválido.',
        closeModal
      );
      return;
    }
    if (password === '') {
      showModalAlert(
        'Alert',
        'Senha!',
        'Por favor, digite sua senha para acesso.',
        closeModal
      );
      return;
    }
    if (!validatePassword(password)) {
      showModalAlert(
        'Alert',
        'Senha inválida!',
        'Requisitos mínimo de segurança de senha inválido.',
        closeModal
      );
      return;
    }
    dataSend.email = email;
    dataSend.password = password;
    try {
      const dataRegister = await userRegister(dataSend);
      if (dataRegister.status === 400 || dataRegister.status === 409) {
        showModalAlert(
          'Alert',
          dataRegister.title,
          dataRegister.msg,
          closeModal
        );
        return;
      } else if (dataRegister.status === 201) {
        showModalAlert(
          'Next',
          dataRegister.title,
          dataRegister.msg,
          showModalLogin
        );
      }
    } catch (error) {
      showModalAlert('Alert', 'Erro de Conexão!', error, closeModal);
      return;
    }
  });
}

export async function showModalUser() {
  let userData;
  try {
    const dataUserSection = await userSection();
    if (dataUserSection.status === 401) {
      showModalAlert(
        'Next',
        dataUserSection.title,
        dataUserSection.msg,
        async () => {
          await exitSession();
        }
      );
    } else if (
      dataUserSection.status === 404 ||
      dataUserSection.status === 400
    ) {
      showModalAlert(
        'Alert',
        dataUserSection.title,
        dataUserSection.msg,
        closeModal
      );
      return;
    } else if (dataUserSection.status === 200) {
      const level = dataUserSection.level;
      await openSession(level);
      userData = dataUserSection;
    }
  } catch (error) {
    showModalAlert('Alert', 'Erro de Conexão!', error, closeModal);
    return;
  }

  const modal = document.getElementById('modal-register');
  const title = document.getElementById('modal-register-title');
  const content = document.getElementById('modal-register-main');
  const btnClose = document.getElementById('close-register');
  const footer = document.getElementById('modal-register-footer');

  title.textContent = 'Dados da Conta';
  content.innerHTML = `
    <form id="formRegister" class="form">
      <div id="nameClient" class="requirements-content">
        <div class="form-group">
          <input class="form-group-input" type="text" id="name" name="name" placeholder="">
          <label class="form-group-label" for="">Nome e Sobre nome:</label>
          ${formGroupPerson}
        </div>
        <div id="nameHelp" class="requirements hidden"></div>
      </div>
      <div class="requirements-content">
        <div class="form-group">
          <input class="form-group-input" type="text" id="email" name="email" autocomplete="username" required>
          <label class="form-group-label" for="">E-mail:</label>
          ${formGroupMail}
        </div>
        <div id="emailHelp" class="requirements hidden"></div>
      </div>
      <div class="requirements-content">
        <div class="form-group">
          <input class="form-group-input" type="password" id="password" class="icon-input"  name="password" autocomplete="new-password" required>
          <label class="form-group-label" for="">Nova senha:</label>
          <button type="button" id="togglePassword">
            ${formGroupEye}
          </button>
        </div>
        <ul id="passwordRequirements" class="requirements hidden">
          <li class="requirement" data-requirement="length">8 Caracteres</li>
          <li class="requirement" data-requirement="uppercase">Letra Maiúscula</li>
          <li class="requirement" data-requirement="lowercase">Letra Minúscula</li>
          <li class="requirement" data-requirement="number">Número</li>
          <li class="requirement" data-requirement="special">Caractere Especial</li>
        </ul>
      </div>
      <div class="form-group">
        <input class="form-group-input" type="password" id="currentPassword" class="icon-input"  name="currentPassword" autocomplete="new-password" required>
        <label class="form-group-label" for="">Senha atual:</label>
        <button type="button" id="toggleCurrentPassword">
          ${formGroupEye}
        </button>
      </div>
    </form>
  `;
  footer.innerHTML = `
    <div class="modal-user-footer">
      <button id="submit" class="modal-content-btn-ok">Enviar</button>
    </div>
  `;

  modal.style.display = 'block';

  btnClose.onclick = function () {
    closeModalRegister();
  };

  const nameInput = document.getElementById('name');
  const nameHelp = document.getElementById('nameHelp');

  const emailInput = document.getElementById('email');
  const emailHelp = document.getElementById('emailHelp');

  const passwordInput = document.getElementById('password');
  const requirements = document.querySelectorAll('.requirement');
  const requirement = document.getElementById('passwordRequirements');
  const togglePasswordButton = document.getElementById('togglePassword');

  const currentPasswordInput = document.getElementById('currentPassword');
  const toggleCurrentPasswordButton = document.getElementById(
    'toggleCurrentPassword'
  );

  togglePasswordButton.addEventListener('click', () => {
    const type =
      passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordButton.innerHTML =
      type === 'password'
        ? '<i class="bi bi-eye toggle-icon-input">'
        : '<i class="bi bi-eye-slash toggle-icon-input"></i>';
  });

  toggleCurrentPasswordButton.addEventListener('click', () => {
    const type =
      currentPasswordInput.getAttribute('type') === 'password'
        ? 'text'
        : 'password';
    currentPasswordInput.setAttribute('type', type);
    toggleCurrentPasswordButton.innerHTML =
      type === 'password' ? formGroupEye : formGroupEyeSlash;
  });

  nameInput.addEventListener('input', function () {
    const nameValue = nameInput.value.trim();
    if (nameInput.value !== '') {
      nameHelp.classList.remove('hidden');
    }
    if (validateName(nameValue)) {
      nameHelp.textContent = 'Nome válido!';
      nameHelp.style.color = 'var(--color-valid)';
      nameInput.classList.add('valid');
      nameInput.classList.remove('invalid');
    } else {
      nameHelp.textContent = 'Digite nome e sobrenome.';
      nameHelp.style.color = 'var(--color-invalid)';
      nameInput.classList.add('invalid');
      nameInput.classList.remove('valid');
    }
  });

  nameInput.addEventListener('blur', function () {
    nameInput.value = formatName(nameInput.value);
  });

  emailInput.addEventListener('input', function () {
    const emailValue = emailInput.value.trim();
    if (emailInput.value !== '') {
      emailHelp.classList.remove('hidden');
    }
    if (validateEmail(emailValue)) {
      emailHelp.textContent = 'E-mail válido!';
      emailHelp.style.color = 'var(--color-valid)';
      emailInput.classList.add('valid');
      emailInput.classList.remove('invalid');
    } else {
      emailHelp.textContent = 'Digite um e-mail válido';
      emailHelp.style.color = 'var(--color-invalid)';
      emailInput.classList.add('invalid');
      emailInput.classList.remove('valid');
    }
  });

  function checkPasswordRequirements(password) {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[@$!%*?&#]/.test(password),
    };

    requirements.forEach((requirement) => {
      const key = requirement.dataset.requirement;
      if (checks[key]) {
        requirement.style.color = 'var(--color-valid)';
        requirement.classList.add('valid');
      } else {
        requirement.style.color = 'var(--color-invalid)';
        requirement.classList.remove('valid');
      }
    });
  }

  passwordInput.addEventListener('input', function () {
    if (passwordInput.value !== '') {
      requirement.classList.remove('hidden');
    }

    const password = passwordInput.value;
    checkPasswordRequirements(password);

    if (
      password &&
      Array.from(requirements).every((req) => req.classList.contains('valid'))
    ) {
      passwordInput.classList.add('valid');
      passwordInput.classList.remove('invalid');
    } else {
      passwordInput.classList.add('invalid');
      passwordInput.classList.remove('valid');
    }
  });

  const name = document.getElementById('name');
  const email = document.getElementById('email');

  name.value = userData.name;
  email.value = userData.email;

  const send = document.getElementById('submit');
  send.addEventListener('click', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const data = {};

    if (name === '') {
      showModalAlert(
        'Alert',
        'Nome e Sobrenome!',
        'Por favor, digite seu Nome.',
        closeModal
      );
      return;
    }

    if (!validateName(name)) {
      showModalAlert(
        'Alert',
        'Nome Inválido!',
        'Por favor, digite seu nome e sobrenome.',
        closeModal
      );
      return;
    }
    if (email === '') {
      showModalAlert(
        'Alert',
        'E-mail!',
        'Por favor, digite seu e-mail.',
        closeModal
      );
      return;
    }
    if (!validateEmail(email)) {
      showModalAlert(
        'Alert',
        'E-mail inválido!',
        'E-mail informado inválido.',
        closeModal
      );
      return;
    }
    if (password === '') {
      showModalAlert(
        'Alert',
        'Senha!',
        'Por favor, digite sua nova senha.',
        closeModal
      );
      return;
    }
    if (!validatePassword(password)) {
      showModalAlert(
        'Alert',
        'Senha inválida!',
        'Requisitos mínimo de segurança de senha inválido.',
        closeModal
      );
      return;
    }

    if (currentPassword === '') {
      showModalAlert(
        'Alert',
        'Senha!',
        'Por favor, digite a senha atual.',
        closeModal
      );
      return;
    }
    if (!validatePassword(currentPassword)) {
      showModalAlert(
        'Alert',
        'Senha inválida!',
        'Senha atual inválida',
        closeModal
      );
      return;
    }
    data.name = name;
    data.email = email;
    data.password = password;
    data.currentPassword = currentPassword;
    try {
      const dataUserUpdate = await userUpdate(data);
      if (dataUserUpdate.status === 404 || dataUserUpdate.status === 401) {
        showModalAlert(
          'Next',
          dataUserUpdate.title,
          dataUserUpdate.msg,
          async () => {
            await exitSession();
          }
        );
      } else if (
        dataUserUpdate.status === 400 ||
        dataUserUpdate.status === 409
      ) {
        showModalAlert(
          'Alert',
          dataUserUpdate.title,
          dataUserUpdate.msg,
          closeModal
        );
        return;
      } else if (dataUserUpdate.status === 200) {
        const level = dataUserUpdate.level;
        showModalAlert(
          'Next',
          dataUserUpdate.title,
          dataUserUpdate.msg,
          async () => {
            await openSession(level);
            closeModalRegister();
          }
        );
      }
    } catch (error) {
      showModalAlert('Alert', 'Erro de conexão!!', error, closeModal);
      return;
    }
  });
}

export async function showModalLogoff() {
  showModalAlert(
    'Confirm',
    'Confirmar Logout!',
    'Deseja mesmo sair?',
    async () => {
      try {
        const logoff = await userLogoff();
        if (logoff.status === 201) {
          showModalAlert(
            'Next',
            'Sessão Encerrada!',
            'Logout realizado com sucesso! Até maís.',
            async () => {
              await exitSession();
            }
          );
        }
      } catch (error) {
        showModalAlert('Alert', 'Erro de conexão!!', error, closeModal);
        return;
      }
    }
  );
}

export async function showModalDeleteUser() {
  showModalAlert(
    'Confirm',
    'Confirmar Exclusão!',
    'Deseja mesmo Excluir sua conta de acesso?',
    async () => {
      try {
        const deleteAccount = await userDelete();
        if (deleteAccount.status === 200) {
          showModalAlert('Next', deleteAccount.title, deleteAccount.msg, () => {
            localStorage.removeItem('returnModal');
            localStorage.removeItem('session');
            localStorage.removeItem('sessionExpiration');
            window.location.reload();
          });
        }
      } catch (error) {
        showModalAlert('Alert', 'Erro de conexão!!', error, closeModal);
        return;
      }
    }
  );
}
