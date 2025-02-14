import {
  closeModal,
  closeModalDetails,
  exitSession,
  openSession,
  returnModal,
  showModalAlert,
} from '../scripts/modals.js';
import { dataClient, registerAddress } from '../scripts/services.js';

export async function newAddress() {
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
  const modal = document.getElementById('modal-details');
  const title = document.getElementById('modal-details-title');
  const content = document.getElementById('modal-details-main');
  const btnClose = document.getElementById('close-details');
  const btnReturn = document.getElementById('arrow-details');
  const footer = document.getElementById('modal-details-footer');

  title.textContent = 'Cadastro de Endereço';
  content.innerHTML = `
    <div class="form-content">
      <div class="form-center">
        <label class="label"> Tipo de Endereço: </label>
        <div class="radio-container">
          <label class="label">
            <input type="radio" class="radio" name="addressType" value="Residencial">
            <span class="span">Residencial</span>
          </label>
          <label class="label">
            <input type="radio" class="radio" name="addressType" value="Empresarial">
            <span class="span">Empresarial</span>
          </label>
        </div>
      </div>
      <div id="divPostalCod" class="hidden" style="width: 50%;">
        <input class="form-group-input" type="tel" id="postalCode" name="postalCode" required maxlength="9" inputmode="numeric">
        <label class="form-group-label" for="">Digite o CEP:</label>
      </div>
      <div id="form-address-data" class="hidden">
        <div class="data-items">
          <label class="label">
            Endereço:
            <span id="street" class="span"></span>
          </label>
          <label class="label">
            Bairro:
            <span id="district" class="span"></span>
          </label>
          <label class="label">
            Cidade:
            <span id="city" class="span"></span> / 
            <span id="state" class="span"></span>
          </label>
        </div>
        <div class="form-center">
          <div class="form-group" style="width: 60%;">
            <input class="form-group-input" type="tel" id="number" name="number" required maxlength="9" inputmode="numeric">
            <label class="form-group-label" for="">Número:</label>
          </div>
          <div class="form-group" style="width: 60%;">
            <input class="form-group-input" type="text" id="complement" name="complement" maxlength="15" placeholder="">
            <label class="form-group-label" for="">Complemento:</label>
          </div>
        </div>
      </div>      
    </div>
  `;

  footer.innerHTML = `
    <div class="modal-user-footer">
      <button type="button" id="createBtn" class="modal-content-btn-disabled" disabled>Salvar</button>
    </div>
  `;

  btnReturn.onclick = async function () {
    await returnModal();
    closeModalDetails();
  };

  btnClose.onclick = async function () {
    closeModalDetails();
  };

  modal.style.display = 'block';

  function toggleAddressFields() {
    const addressTypeInputs = document.querySelectorAll(
      'input[name="addressType"]'
    );

    const postalCodeContainer = document.getElementById('divPostalCod');

    addressTypeInputs.forEach((input) => {
      input.addEventListener('change', () => {
        if (input.checked) {
          postalCodeContainer.classList.remove('hidden');
          postalCodeContainer.classList.add('form-group');
        }
      });
    });
  }

  toggleAddressFields();

  function validateAddressForm() {
    const createBtn = document.getElementById('createBtn');
    const street = document.getElementById('street').textContent.trim();
    const number = document.getElementById('number').value.trim();
    const district = document.getElementById('district').textContent.trim();
    const city = document.getElementById('city').textContent.trim();
    const state = document.getElementById('state').textContent.trim();
    const postalCode = document.getElementById('postalCode').value.trim();
    const addressType = document.querySelector(
      'input[name="addressType"]:checked'
    );

    const isFormValid =
      postalCode !== '' &&
      street !== '' &&
      district !== '' &&
      city !== '' &&
      state !== '' &&
      number !== '' &&
      !isNaN(number) &&
      parseInt(number) >= 1 &&
      addressType !== null;

    createBtn.disabled = !isFormValid;
    createBtn.className = isFormValid
      ? 'modal-content-btn-ok'
      : 'modal-content-btn-disabled';
  }

  function setupFormValidation() {
    const inputsToWatch = ['postalCode', 'number'];

    inputsToWatch.forEach((id) => {
      const input = document.getElementById(id);
      input.addEventListener('input', validateAddressForm);
    });

    const addressTypeInputs = document.querySelectorAll(
      'input[name="addressType"]'
    );
    addressTypeInputs.forEach((input) =>
      input.addEventListener('change', validateAddressForm)
    );

    ['street', 'district', 'city', 'state'].forEach((id) => {
      const element = document.getElementById(id);
      const observer = new MutationObserver(validateAddressForm);
      observer.observe(element, { childList: true, subtree: true });
    });
  }

  setupFormValidation();

  const createNewAddress = document.getElementById('createBtn');
  createNewAddress.addEventListener('click', async () => {
    const street = document.getElementById('street').textContent;
    const number = document.getElementById('number').value;
    const complement = document.getElementById('complement').value;
    const district = document.getElementById('district').textContent;
    const city = document.getElementById('city').textContent;
    const state = document.getElementById('state').textContent;
    const postalCode = document.getElementById('postalCode').value;
    const addressTypeInput = document.querySelector(
      'input[name="addressType"]:checked'
    );
    const addressType = addressTypeInput ? addressTypeInput.value : '';
    if (postalCode.trim() === '') {
      showModalAlert(
        'Alert',
        'CEP Obrigatório!!',
        'Digite o CEP do endereço.',
        closeModal
      );
      return;
    }
    if (
      street.trim() === '' ||
      district.trim() === '' ||
      city.trim() === '' ||
      state.trim() === ''
    ) {
      showModalAlert(
        'Alert',
        'Endereço Obrigatório!!',
        'Digite um CEP válido para carregar o endereço.',
        closeModal
      );
      return;
    }
    if (number.trim() === '' || isNaN(number) || parseInt(number) < 1) {
      showModalAlert(
        'Alert',
        'Número Inválido!!',
        'Digite um número válido para o endereço.',
        closeModal
      );
      return;
    }
    if (addressType === '') {
      showModalAlert(
        'Alert',
        'Tipo de Endereço!!',
        'Selecione um tipo de endereço.',
        closeModal
      );
      return;
    }

    const dataSend = {
      clientId: client._id,
      postalCode: postalCode,
      street: street,
      number: number,
      complement: complement,
      district: district,
      city: city,
      state: state,
      addressType: addressType,
    };
    try {
      const dataAddressUser = await registerAddress(dataSend);
      if (dataAddressUser.status === 401) {
        showModalAlert(
          'Next',
          dataAddressUser.title,
          dataAddressUser.msg,
          async () => {
            await exitSession();
          }
        );
      } else if (
        dataAddressUser.status === 400 ||
        dataAddressUser.status === 409 ||
        dataAddressUser.status === 500
      ) {
        showModalAlert(
          'Alert',
          dataAddressUser.title,
          dataAddressUser.msg,
          closeModal
        );
      } else if (dataAddressUser.status === 201) {
        const level = dataAddressUser.level;
        await openSession(level);
        await returnModal();
        closeModalDetails();
      }
    } catch (error) {
      console.error('Erro ao cadastrar endereço:', error);
      showModalAlert('Alert', 'Erro de conexão', error.message, closeModal);
    }
  });

  const postalCodeInput = document.getElementById('postalCode');
  const numberInput = document.getElementById('number');

  postalCodeInput.addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  });

  numberInput.addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  });

  postalCodeInput.addEventListener('input', formatPostalCode);
  postalCodeInput.addEventListener('input', checkPostalCodeLength);
  numberInput.addEventListener('input', formatNumber);

  function formatPostalCode(event) {
    const input = event.target;
    input.value = input.value.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  function formatNumber(event) {
    const input = event.target;
    input.value = input.value.replace(/^0+/, '');
  }

  async function checkPostalCodeLength(event) {
    const input = event.target;
    const addressDataDiv = document.getElementById('form-address-data');
    const numberField = document.getElementById('number');
    const length = input.value.length;
    if (length === 9) {
      const isValid = await reqPostalCode(input.value);
      if (isValid) {
        input.style.backgroundColor = 'var(--color-valid)';
        input.style.color = 'var(--color-3)';
        addressDataDiv.classList.remove('hidden');
        addressDataDiv.classList.add('form-center');
        numberField.disabled = false;
        numberField.focus();
      } else {
        input.style.backgroundColor = 'var(--color-invalid)';
        input.style.color = 'var(--color-3)';
        addressDataDiv.classList.remove('form-center');
        addressDataDiv.classList.add('hidden');
      }
    } else {
      input.style.backgroundColor = '';
      input.style.color = '';
      addressDataDiv.classList.remove('form-center');
      addressDataDiv.classList.add('hidden');
    }
  }

  async function reqPostalCode(code) {
    try {
      const postalCodeQuery = await fetch(
        `https://viacep.com.br/ws/${code}/json/`
      );
      const postalCodeData = await postalCodeQuery.json();
      if (postalCodeData.erro) {
        return false;
      }
      document.getElementById('street').textContent = postalCodeData.logradouro;
      document.getElementById('district').textContent = postalCodeData.bairro;
      document.getElementById('city').textContent = postalCodeData.localidade;
      document.getElementById('state').textContent = postalCodeData.uf;
      return true;
    } catch (error) {
      showModalAlert(
        'Alert',
        'CEP inexistente!!',
        'Digite um CEP válido.',
        closeModal
      );
      return false;
    }
  }
}
