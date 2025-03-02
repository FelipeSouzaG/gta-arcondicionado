import {
  closeModal,
  closeModalRegister,
  exitSession,
  openSession,
  showModalAlert,
} from '../scripts/modals.js';
import { modalNewRequest } from './Request.js';
import { clientUpdate, dataClient, registerClient } from '../scripts/fetch.js';
import {
  formatName,
  formatPhoneValue,
  formatRegister,
  setupValidation,
  validateEmail,
  validateName,
  validatePhone,
  validateRegister,
} from '../scripts/validation.js';
import {
  formGroupMail,
  formGroupNumber,
  formGroupPerson,
  formGroupPhone,
} from '../scripts/icons.js';

export async function newClientModal() {
  const modal = document.getElementById('modal-register');
  const title = document.getElementById('modal-register-title');
  const content = document.getElementById('modal-register-main');
  const footer = document.getElementById('modal-register-footer');
  const btnClose = document.getElementById('close-register');

  title.textContent = 'Dados de Cliente';

  content.innerHTML = `
    <div class="form-content">
      <div class="form-group">
        <input class="form-group-input" type="text" id="phone" required>
        <label class="form-group-label" for="">Telefone:</label>
        ${formGroupPhone}
      </div>
      
      <div class="form-group">
        <input class="form-group-input" type="text" id="register" maxlength="18" placeholder="">
        <label class="form-group-label" for="">CPF / CNPJ:</label>
        ${formGroupNumber}
      </div>
      
      <div class="form-group">
        <input class="form-group-input" type="text" id="phoneAlternative" placeholder="">
        <label class="form-group-label" for="">Telefone Alternativo:</label>
        ${formGroupPhone}
      </div>
    </div>
  `;

  footer.innerHTML = `
    <div class="modal-user-footer">
      <button type="button" id="registerClient" class="modal-content-btn-ok">Salvar</button>
    </div>
  `;

  modal.style.display = 'block';

  btnClose.onclick = function () {
    closeModalRegister();
  };

  const register = document.getElementById('register');
  const phone = document.getElementById('phone');
  const phoneAlternative = document.getElementById('phoneAlternative');

  setupValidation(register, validateRegister, formatRegister);
  setupValidation(phone, validatePhone, formatPhoneValue);
  setupValidation(phoneAlternative, validatePhone, formatPhoneValue);

  const sendDataClient = document.getElementById('registerClient');

  sendDataClient.addEventListener('click', async () => {
    const phone = document.getElementById('phone').value.replace(/\D/g, '');
    const cpfCnpj =
      document.getElementById('register').value.replace(/\D/g, '') || null;
    const phoneAlternative =
      document.getElementById('phoneAlternative').value.replace(/\D/g, '') ||
      null;
    const data = {};

    if (!phone) {
      showModalAlert(
        'Alert',
        'Telefone!',
        'Por favor, digite o telefone para registro de dados.',
        closeModal
      );
      return;
    }
    if (!validatePhone(phone)) {
      showModalAlert(
        'Alert',
        'Telefone!',
        'Digite o Telefone do cliente no formato (DDD)+Número',
        closeModal
      );
      return;
    }
    data.phone = phone;
    if (cpfCnpj) {
      if (!validateRegister(cpfCnpj)) {
        const register = cpfCnpj.length === 11 ? 'CPF' : 'CNPJ';
        showModalAlert(
          'Alert',
          `${register} Inválido!`,
          `Por favor, digite um ${register} válido.`,
          closeModal
        );
        return;
      }
      data.register = cpfCnpj;
    }
    if (phoneAlternative) {
      if (!validatePhone(phoneAlternative)) {
        showModalAlert(
          'Alert',
          'Telefone Alternativo!',
          'Digite o Telefone Alternativo do cliente no formato (DDD)+Número',
          closeModal
        );
        return;
      }
      data.alternativePhone = phoneAlternative;
    }
    try {
      const clientRegister = await registerClient(data);
      if (clientRegister.status === 401) {
        showModalAlert(
          'Next',
          clientRegister.title,
          clientRegister.msg,
          async () => {
            await exitSession();
          }
        );
      } else if (
        clientRegister.status === 400 ||
        clientRegister.status === 409 ||
        clientRegister.status === 500
      ) {
        showModalAlert(
          'Alert',
          clientRegister.title,
          clientRegister.msg,
          closeModal
        );
        return;
      } else if (clientRegister.status === 201) {
        const level = clientRegister.level;
        await openSession(level);
        showModalAlert(
          'Next',
          clientRegister.title,
          clientRegister.msg,
          async () => {
            await modalNewRequest();
          }
        );
      }
    } catch (error) {
      console.error('Erro ao buscar dados de endereço:', error);
      showModalAlert('Alert', 'Erro de Conexão!', error.message, closeModal);
      return;
    }
  });
}

export async function showModalClient() {
  let client;
  try {
    const userClient = await dataClient();
    if (userClient.status === 401) {
      showModalAlert('Next', userClient.title, userClient.msg, async () => {
        await exitSession();
      });
    } else if (userClient.status === 404 || userClient.status === 400) {
      showModalAlert('Next', userClient.title, userClient.msg, async () => {
        window.location.reload();
      });
    } else if (userClient.status === 200) {
      const level = userClient.level;
      await openSession(level);
      client = userClient.clientData;
    }
  } catch (error) {
    console.error('Erro ao buscar dados de endereço:', error);
    showModalAlert('Alert', 'Erro de Conexão!', error.message, closeModal);
    return;
  }

  const modal = document.getElementById('modal-register');
  const title = document.getElementById('modal-register-title');
  const content = document.getElementById('modal-register-main');
  const btnClose = document.getElementById('close-register');
  const footer = document.getElementById('modal-register-footer');

  title.textContent = 'Dados de Cliente';
  content.innerHTML = `
    <div class="form-content">
      <div class="form-group">
        <input class="form-group-input" type="text" id="name" required>
        <label class="form-group-label" for="">Nome e Sobre nome:</label>
        ${formGroupPerson}
      </div>

      <div class="form-group">
        <input class="form-group-input" type="text" id="email" autocomplete="username" required>
        <label class="form-group-label" for="">E-mail:</label>
        ${formGroupMail}
      </div>
        
      <div class="form-group">
        <input class="form-group-input" type="text" id="phone" required>
        <label class="form-group-label" for="">Telefone:</label>
        ${formGroupPhone}
      </div>
      
      <div class="form-group">
        <input class="form-group-input" type="text" id="register" maxlength="18" placeholder="">
        <label class="form-group-label" for="">CPF / CNPJ:</label>
        ${formGroupNumber}
      </div>
      
      <div class="form-group">
        <input class="form-group-input" type="text" id="phoneAlternative" placeholder="">
        <label class="form-group-label" for="">Telefone Alternativo:</label>
        ${formGroupPhone}
      </div>

    </di>
  `;
  footer.innerHTML = `
    <div class="modal-user-footer">
      <button id="saveClient" class="modal-content-btn-ok">Enviar</button>
    </div>
  `;

  modal.style.display = 'block';

  btnClose.onclick = function () {
    closeModalRegister();
  };

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const registerInput = document.getElementById('register');
  const phoneAlternativeInput = document.getElementById('phoneAlternative');

  nameInput.addEventListener('input', function () {
    const valid = validateName(nameInput.value);
    if (valid) {
      nameInput.classList.add('valid');
      nameInput.classList.remove('invalid');
    } else {
      nameInput.classList.add('invalid');
      nameInput.classList.remove('valid');
    }
    if (nameInput.value === '') {
      nameInput.classList.remove('valid');
      nameInput.classList.remove('invalid');
      nameInput.classList.add('form-group-input');
    }
  });

  nameInput.addEventListener('blur', function () {
    nameInput.value = formatName(nameInput.value);
  });

  setupValidation(registerInput, validateRegister, formatRegister);
  setupValidation(phoneInput, validatePhone, formatPhoneValue);
  setupValidation(phoneAlternativeInput, validatePhone, formatPhoneValue);
  setupValidation(emailInput, validateEmail);

  const nameValue = document.getElementById('name');
  const emailValue = document.getElementById('email');
  const phoneValue = document.getElementById('phone');
  const registerValue = document.getElementById('register');
  const phoneAlternativeValue = document.getElementById('phoneAlternative');

  nameValue.value = client.name;
  emailValue.value = client.email;
  phoneValue.value = formatPhoneValue(client.phone);
  const isRegister = client.register && Object.keys(client.register).length > 0;
  registerValue.value =
    isRegister && client.register.length > 0
      ? formatRegister(client.register)
      : null;
  const isPhoneAlternative =
    client.alternativePhone && Object.keys(client.alternativePhone).length > 0;
  phoneAlternativeValue.value =
    isPhoneAlternative && client.alternativePhone.length > 0
      ? formatPhoneValue(client.alternativePhone)
      : null;

  const saveClient = document.getElementById('saveClient');
  saveClient.addEventListener('click', async () => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.replace(/\D/g, '');
    const cpfCnpj =
      document.getElementById('register').value.replace(/\D/g, '') || null;
    const phoneAlternative =
      document.getElementById('phoneAlternative').value.replace(/\D/g, '') ||
      null;
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
    if (phone === '') {
      showModalAlert(
        'Alert',
        'Telefone!',
        'Por favor, digite seu telefone de contato principal.',
        closeModal
      );
      return;
    }
    if (!validatePhone(phone)) {
      showModalAlert(
        'Alert',
        'Telefone Inválido!',
        'Digite o telefone no formato (DDD) + Número.',
        closeModal
      );
      return;
    }
    if (cpfCnpj) {
      if (!validateRegister(cpfCnpj)) {
        const register = cpfCnpj.length === 11 ? 'CPF' : 'CNPJ';
        showModalAlert(
          'Alert',
          `${register} Inválido!`,
          `Por favor, digite um ${register} válido.`,
          closeModal
        );
        return;
      }
      data.register = cpfCnpj;
    }
    if (phoneAlternative) {
      if (!validatePhone(phoneAlternative)) {
        showModalAlert(
          'Alert',
          'Telefone Alternativo!',
          'Digite o Telefone Alternativo do cliente no formato (DDD)+Número',
          closeModal
        );
        return;
      }
      data.alternativePhone = phoneAlternative;
    }
    data.name = name;
    data.email = email;
    data.phone = phone;
    try {
      const dataClientUpdate = await clientUpdate(data, client._id);
      if (dataClientUpdate.status === 401) {
        showModalAlert(
          'Next',
          dataClientUpdate.title,
          dataClientUpdate.msg,
          async () => {
            await exitSession();
          }
        );
      } else if (
        dataClientUpdate.status === 403 ||
        dataClientUpdate.status === 404
      ) {
        showModalAlert(
          'Next',
          dataClientUpdate.title,
          dataClientUpdate.msg,
          () => {
            window.location.reload();
          }
        );
      } else if (
        dataClientUpdate.status === 500 ||
        dataClientUpdate.status === 409
      ) {
        showModalAlert(
          'Alert',
          dataClientUpdate.title,
          dataClientUpdate.msg,
          closeModal
        );
        return;
      } else if (dataClientUpdate.status === 200) {
        const level = dataClientUpdate.level;
        showModalAlert(
          'Next',
          dataClientUpdate.title,
          dataClientUpdate.msg,
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
