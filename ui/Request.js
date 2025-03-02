import { formGroupPort, renderRequestDetail } from '../scripts/icons.js';
import {
  closeModal,
  closeModalDetails,
  closeModalRegister,
  exitSession,
  openSession,
  showModalAlert,
} from '../scripts/modals.js';
import {
  userRequest,
  userAddress,
  registerRequest,
  getBudget,
  updateBudgetClient,
} from '../scripts/fetch.js';
import { normalizeDate } from '../scripts/validation.js';
import { newAddress } from './Address.js';
import { newClientModal } from './Client.js';

export async function modalListRequest() {
  let requests = [];
  try {
    const requestData = await userRequest();
    if (requestData.status === 401) {
      showModalAlert('Next', requestData.title, requestData.msg, async () => {
        await exitSession();
      });
    } else if (requestData.status === 400) {
      requests = [];
    } else if (requestData.status === 200) {
      const level = requestData.level;
      await openSession(level);
      requests = [...requestData.requests];
    }
  } catch (error) {
    console.error('Erro ao buscar dados de endereço:', error);
    showModalAlert('Alert', 'Erro de Conexão!', error.message, closeModal);
    return;
  }

  if (requests.length === 0) {
    showModalAlert(
      'Next',
      'Nenhum Serviço solicitado!',
      'Faça uma solicitação de serviço.',
      async () => {
        localStorage.setItem(
          'returnModal',
          JSON.stringify({
            type: 'listRequest',
            data: null,
          })
        );
        await modalNewRequest();
        closeModalRegister();
      }
    );
  }

  let filteredRequests = requests;

  const modal = document.getElementById('modal-register');
  const title = document.getElementById('modal-register-title');
  const content = document.getElementById('modal-register-main');
  const footer = document.getElementById('modal-register-footer');
  const btnClose = document.getElementById('close-register');

  title.textContent = 'Solicitações de Serviços';
  content.innerHTML = `
      <div class="form-center-item">
        <select class="select" id="filter-request-status">
          <option value="">Status da Requesição: Todos</option>
          <option value="Pendente">Pendente Avaliação</option>
          <option value="Visita Técnica">Visita Técnica Agendada</option>
          <option value="Finalizado">Finalizado</option>
        </select>
      </div>
  
      <table class="details-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Requisição</th>
          </tr>
        </thead>
        <tbody id="request-list">
          ${renderRequestRows(filteredRequests)}
        </tbody>
      </table>
    `;

  footer.innerHTML = `
      <div class="modal-user-footer">
        <button type="button" id="newRequest" class="modal-content-btn-enable">Novo</button>
      </div>
    `;

  modal.style.display = 'block';

  btnClose.onclick = async () => closeModalRegister();

  const requestStatusFilter = document.getElementById('filter-request-status');

  requestStatusFilter.addEventListener('change', filterRequestsData);

  function filterRequestsData() {
    const selectedStatus = document.getElementById(
      'filter-request-status'
    ).value;

    const filteredRequests = requests.filter(
      (request) => !selectedStatus || request.requestStatus === selectedStatus
    );

    document.getElementById('request-list').innerHTML =
      renderRequestRows(filteredRequests);
  }

  const newRequestBtn = document.getElementById('newRequest');
  newRequestBtn.addEventListener('click', modalNewRequest);
}

function renderRequestRows(requests) {
  return requests
    .map(
      (request) => `
        <tr>
          <td>${request.requestStatus}</td>
          <td>
            <div class="center">
              ${request.requestNumber}
              ${renderRequestDetail(request)}
            </div>
          </td>
        </tr>
      `
    )
    .join('');
}

document.addEventListener('click', async (event) => {
  const target = event.target.closest('.view-request-details-btn');
  if (target) {
    const request = JSON.parse(target.dataset.request);
    await openRequestDetails(request);
    closeModalRegister();
  }
});

export async function openRequestDetails(request) {
  const modal = document.getElementById('modal-details');
  const title = document.getElementById('modal-details-title');
  const content = document.getElementById('modal-details-main');
  const btnClose = document.getElementById('close-details');
  const btnReturn = document.getElementById('arrow-details');
  const footer = document.getElementById('modal-details-footer');

  title.textContent = 'Dados da requisição';

  const reqType = request.requestType;
  let typeService;
  const isServiceIds =
    request.serviceIds && Object.keys(request.serviceIds).length > 0;

  const isMaintenanceProblem =
    request.maintenanceProblem &&
    Object.keys(request.maintenanceProblem).length > 0;

  const isInstallation =
    request.installationEquipment &&
    Object.keys(request.installationEquipment).length > 0;

  const servicesTableRows = generateServiceTableRows(request.serviceIds);
  function generateServiceTableRows(services) {
    let rows = '';
    services.forEach((service) => {
      rows += ` ${service.serviceName}, `;
    });
    const tableServices = `
          <tr>
            <td>Serviços</td>
            <td>${rows}</td>
          </tr>
        `;
    return tableServices;
  }

  if (reqType === 'Manutenção') {
    if (isServiceIds) {
      typeService = servicesTableRows;
    } else if (isMaintenanceProblem) {
      typeService = `
            <tr>
              <td>Problemas relatados:</td>
              <td>${request.maintenanceProblem}</td>
            </tr>
          `;
    } else {
      typeService = '';
    }
  } else if (reqType === 'Instalação') {
    if (isInstallation && isServiceIds) {
      typeService = `
            <tr>
              <td>Equipamento:</td>
              <td>${request.installationEquipment}</td>
            </tr>
            ${servicesTableRows}
          `;
    } else if (isInstallation && !isServiceIds) {
      typeService = `
            <tr>
              <td>Equipamento:</td>
              <td>${request.installationEquipment}</td>
            </tr>
          `;
    } else {
      typeService = '';
    }
  } else {
    typeService = '';
  }

  const isComplement =
    request.addressId.complement &&
    Object.keys(request.addressId.complement).length > 0;
  const complement =
    isComplement && request.addressId.complement.length > 0
      ? ` - Compl: ${request.addressId.complement}`
      : '';
  let status;
  let budgetBtnStatus;
  if (request.requestStatus === 'Pendente') {
    status = `<tr>
            <td colspan="2" style="text-align: center; background-color: var(--color-valid);">
              Pendente avaliação técnica. Aguarde retorno do Técnico.
            </td>
          </tr>`;
  } else if (request.requestStatus === 'Retorno') {
    status = `<tr>
            <td colspan="2" style="text-align: center; background-color: var(--color-valid);">
              Requisição gerada para serviço de Retorno 
            </td>
          </tr>`;
  } else if (request.requestStatus === 'Visita Técnica Programada') {
    status = `<tr>
            <td colspan="2" style="text-align: center; background-color: var(--color-valid);">
              Visita técnica agendanda para ${normalizeDate(
                request.dateVisit
              )} ás ${request.timeVisit}.
            </td>
          </tr>`;
  } else if (request.requestStatus === 'Visita Técnica Realizada') {
    status = `<tr>
      <td colspan="2" style="text-align: center; background-color: var(--color-valid);">
        Visita técnica Realizada. Aguarde o Orçamento ou a Programação da Ordem de Serviço.
      </td>
    </tr>`;
  } else if (request.requestStatus === 'Orçamento') {
    const isBudget =
      request.budgetId.budgetStatus &&
      Object.keys(request.budgetId.budgetStatus).length > 0;
    const budgetStatus = isBudget ? request.budgetId.budgetStatus : '';
    if (budgetStatus === 'Pendente') {
      budgetBtnStatus = 'Pendente';
      status = `<tr>
        <td colspan="2" style="text-align: center; background-color: var(--color-pending);">
          Orçamento aguardando Avaliação e Validação do Cliente
        </td>
      </tr>`;
    } else {
      status = `<tr>
            <td colspan="2" style="text-align: center; background-color: var(--color-invalid);">
              Status Não identificado.
            </td>
          </tr>`;
    }
  } else if (request.requestStatus === 'Orçamento Aprovado') {
    const isBudget =
      request.budgetId.budgetStatus &&
      Object.keys(request.budgetId.budgetStatus).length > 0;
    const budgetStatus = isBudget ? request.budgetId.budgetStatus : '';
    if (budgetStatus === 'Aprovado') {
      status = `<tr>
        <td colspan="2" style="text-align: center; background-color: var(--color-valid);">
          Orçamento Aprovado pelo Cliente. Aguarde Programação de Ordem de Serviço.
        </td>
      </tr>`;
    } else {
      status = `<tr>
            <td colspan="2" style="text-align: center; background-color: var(--color-invalid);">
              Status Não identificado.
            </td>
          </tr>`;
    }
  } else if (request.requestStatus === 'Orçamento Reprovado') {
    const isBudget =
      request.budgetId.budgetStatus &&
      Object.keys(request.budgetId.budgetStatus).length > 0;
    const budgetStatus = isBudget ? request.budgetId.budgetStatus : '';
    if (budgetStatus === 'Reprovado') {
      status = `<tr>
        <td colspan="2" style="text-align: center; background-color: var(--color-invalid);">
          Orçamento Reprovado pelo Cliente. Orçamento será alterado ou a Requisição será encerrada.
        </td>
      </tr>`;
    } else {
      status = `<tr>
            <td colspan="2" style="text-align: center; background-color: var(--color-invalid);">
              Status Não identificado.
            </td>
          </tr>`;
    }
  } else if (request.requestStatus === 'Ordem de Serviço Programada') {
    const isOrder =
      request.orderId.orderStatus &&
      Object.keys(request.orderId.orderStatus).length > 0;
    const orderStatus = isOrder ? request.orderId.orderStatus : '';
    if (orderStatus === 'Programado') {
      status = `<tr>
          <td colspan="2" style="text-align: center; background-color: var(--color-valid);">
             Ordem de Serviço agendanda para ${normalizeDate(
               request.orderId.date
             )} ás ${request.orderId.time}.
          </td>
        </tr>`;
    } else {
      status = `<tr>
                <td colspan="2" style="text-align: center; background-color: var(--color-invalid);">
                  Status Não identificado.
                </td>
              </tr>`;
    }
  } else if (request.requestStatus === 'Ordem de Serviço Realizada') {
    const isOrder =
      request.orderId.orderStatus &&
      Object.keys(request.orderId.orderStatus).length > 0;
    const orderStatus = isOrder ? request.orderId.orderStatus : '';
    if (orderStatus === 'Realizado') {
      status = `<tr>
          <td colspan="2" style="text-align: center; background-color: var(--color-valid);">
            ${request.feedback}
          </td>
        </tr>`;
    } else {
      status = `<tr>
                    <td colspan="2" style="text-align: center; background-color: var(--color-invalid);">
                      Status Não identificado.
                    </td>
                  </tr>`;
    }
  } else if (request.requestStatus === 'Finalizado') {
    status = `<tr>
            <td colspan="2" style="text-align: center; background-color: var(--color-valid);">
            ${request.feedback}
            </td>
          </tr>`;
  }
  const env =
    request.envId && Object.keys(request.envId).length > 0
      ? `<td>${request.envId.split('-').slice(1).join('-')}</td>`
      : '';
  const environment =
    request.environmentId && Object.keys(request.environmentId).length > 0
      ? `<td>${request.environmentId.environmentName}</td>`
      : '';
  content.innerHTML = `
    <table class="details-table">
      <thead>
        <tr>
          <th colspan="2">
            Número da Requisição: ${request.requestNumber}
          </th>
        </tr>
      </thead>
      <tbody>
      ${typeService}
         <tr>
          <td>Status da REQ:</td>
          <td>${request.requestStatus}</td>
        </tr>
        <tr>
          <td>Nome do Ambiente:</td>
          ${environment || env}
        </tr>
        <tr>
          <td>Tipo de Endereço:</td>
          <td>
            ${request.addressId.addressType}
          </td>
        </tr>
        <tr>
          <td colspan="2">${request.addressId.street}, Nº ${
    request.addressId.number
  }${complement}</td>
        </tr>
        ${status}
      </tbody>
    </table>
  `;

  footer.innerHTML = `
    <div class="modal-user-footer">
      <button type="button" id="budgetBtn" class="hidden">Orçamento</button>
    </div>
  `;

  modal.style.display = 'block';

  btnReturn.onclick = async function () {
    await modalListRequest();
    closeModalDetails();
  };

  btnClose.onclick = async function () {
    closeModalDetails();
  };

  function openBudget() {
    const approvedBudget = document.getElementById('budgetBtn');
    if (budgetBtnStatus === 'Pendente') {
      approvedBudget.classList.remove('hidden');
      approvedBudget.classList.add('modal-content-btn-enable');
    } else {
      approvedBudget.classList.remove('modal-content-btn-enable');
      approvedBudget.classList.add('hidden');
    }
  }

  openBudget();

  const openApprovedBudget = document.getElementById('budgetBtn');
  openApprovedBudget.onclick = async function () {
    await approvedBudgetDetails(request);
  };
}

async function approvedBudgetDetails(request) {
  let budget = {};
  try {
    const budgetData = await getBudget(request.budgetId._id);
    if (budgetData.status === 401) {
      showModalAlert('Next', budgetData.title, budgetData.msg, async () => {
        await exitSession();
      });
    } else if (budgetData.status === 404 || budgetData.status === 403) {
      showModalAlert('Next', budgetData.title, budgetData.msg, () => {
        closeModalDetails();
      });
    } else if (budgetData.status === 200) {
      const level = budgetData.level;
      await openSession(level);
      budget = budgetData.budget;
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

  const isEquipment =
    budget.equipment && Object.keys(budget.equipment).length > 0;
  const equipment =
    isEquipment && budget.equipment.length > 0
      ? `
          <thead>
            <tr>
              <th colspan="2" style="text-align: center;">
                Equipamento para instalação
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="2">${budget.equipment}</td>
            </tr>
            <tr>
              <td>Valor do Equipamento:</td>
              <td style="text-align: center;">R$ ${budget.equipmentPrice
                .toFixed(2)
                .replace('.', ',')}</td>
            </tr>
          </tbody>
        `
      : '';
  const equipmentBudget =
    isEquipment && budget.equipment.length > 0
      ? `<tr>
          <td>Equipamento (+)</td>
          <td style="text-align: center;">R$ ${budget.equipmentPrice
            .toFixed(2)
            .replace('.', ',')}</td>
        </tr>`
      : '';
  const servicesTableRows = generateServiceTableRows(budget.serviceIds);
  function generateServiceTableRows(services) {
    let rows = '';
    services.forEach((service) => {
      rows += `
          <tr>
            <td>${service.serviceName}</td>
            <td style="text-align: center;">R$ ${service.servicePrice
              .toFixed(2)
              .replace('.', ',')}</td>
          </tr>
        `;
    });
    return rows;
  }
  title.textContent = 'Aprovação de Orçamento';

  content.innerHTML = `
    <table class="details-table">
      <thead>
        <tr>
          <th colspan="2" style="text-align: center;">
            Número do Orçamento: ${budget.budgetNumber}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Tipo de Serviço:</td>
          <td>${budget.serviceType}</td>
        </tr>
      </tbody>
      ${equipment}
      <thead>
        <tr>
          <th colspan="2" style="text-align: center;">
            Serviços
          </th>
        </tr>
      </thead>
      <tbody>
        ${servicesTableRows}
      </tbody>
      <thead>
        <tr>
          <th colspan="2" style="text-align: center;">
            Orçamento (R$)
          </th>
        </tr>
        <tbody>
          ${equipmentBudget}
          <tr>
            <td>Serviços (+)</td>
            <td style="text-align: center;">R$ ${budget.servicePrice
              .toFixed(2)
              .replace('.', ',')}</td>
          </tr>
          <tr>
            <td>Descontos (-)</td>
            <td style="text-align: center;">R$ ${budget.budgetRebate
              .toFixed(2)
              .replace('.', ',')}</td>
          </tr>
          <tr>
            <td>Total Orçamento (=)</td>
            <td style="text-align: center;">R$ ${budget.budgetPrice
              .toFixed(2)
              .replace('.', ',')}</td>
          </tr>
        </tbody>
      </thead>
    </table>

    <div class="data-items">
      <label class="label">
        <input type="radio" class="radio" name="validateBudget" value="Aprovado">
        <span class="span">Aprovar</span>
      </label>
      <label class="label">
        <input type="radio" class="radio" name="validateBudget" value="Reprovado">
        <span class="span">Reprovar</span>
      </label>
    </div>
  `;
  footer.innerHTML = `
    <div class="modal-user-footer">
      <button type="button" id="sendBudgetBtn" class="hidden"></button>
    </div>
  `;
  modal.style.display = 'block';

  btnReturn.onclick = async function () {
    await modalListRequest();
    closeModalDetails();
  };
  btnClose.onclick = async function () {
    closeModalDetails();
  };

  function toggleBtn() {
    const radioValidate = document.querySelectorAll(
      'input[name="validateBudget"]'
    );
    const sendBtn = document.getElementById('sendBudgetBtn');
    radioValidate.forEach((input) => {
      input.addEventListener('change', () => {
        if (input.value === 'Aprovado' && input.checked) {
          sendBtn.classList.remove('hidden');
          sendBtn.classList.add('modal-content-btn-ok');
          sendBtn.textContent = 'Aprovar';
        } else if (input.value === 'Reprovado' && input.checked) {
          sendBtn.classList.remove('hidden');
          sendBtn.classList.add('modal-content-btn-cancel');
          sendBtn.textContent = 'Reprovar';
        }
      });
    });
  }
  toggleBtn();

  document
    .getElementById('sendBudgetBtn')
    .addEventListener('click', async () => {
      const budgetValue = document.querySelector(
        'input[name="validateBudget"]:checked'
      );
      const sendData = {};
      if (budgetValue.value === 'Aprovado') {
        sendData.budgetStatus = 'Aprovado';
        sendData.feedback = `Orçamento Aprovado pelo Cliente em ${normalizeDate(
          new Date()
        )}`;
      } else if (budgetValue.value === 'Reprovado') {
        sendData.budgetStatus = 'Reprovado';
        sendData.feedback = `Orçamento Reprovado pelo Cliente em ${normalizeDate(
          new Date()
        )}`;
      } else {
        showModalAlert(
          'Alert',
          'Validação de Orçamento',
          'Por favor, valide o Orçamento para enviar',
          closeModal
        );
        return;
      }

      try {
        const budgetData = await updateBudgetClient(sendData, budget._id);
        if (budgetData.status === 401) {
          showModalAlert('Next', budgetData.title, budgetData.msg, async () => {
            await exitSession();
          });
        } else if (
          budgetData.status === 400 ||
          budgetData.status === 409 ||
          budgetData.status === 500
        ) {
          showModalAlert('Alert', budgetData.title, budgetData.msg, closeModal);
        } else if (budgetData.status === 200) {
          const level = budgetData.level;
          showModalAlert('Next', budgetData.title, budgetData.msg, async () => {
            await openSession(level);
            await modalListRequest();
            closeModalDetails();
          });
        }
      } catch (error) {
        showModalAlert('Erro de Conexão', error.message, closeModal);
      }
    });
}

export async function modalNewRequest() {
  const session = localStorage.getItem('session');
  if (session !== 'Cliente') {
    showModalAlert(
      'Next',
      'Registrar dados',
      'Registre os dados de Cliente para a solicitação de serviço.',
      async () => {
        await newClientModal();
      }
    );
    return;
  }
  const modal = document.getElementById('modal-register');
  const title = document.getElementById('modal-register-title');
  const content = document.getElementById('modal-register-main');
  const footer = document.getElementById('modal-register-footer');
  const btnClose = document.getElementById('close-register');

  let addresses = [];
  try {
    const addressData = await userAddress();
    if (addressData.status === 401) {
      showModalAlert('Next', addressData.title, addressData.msg, async () => {
        await exitSession();
      });
    } else if (addressData.status === 403) {
      showModalAlert('Next', addressData.title, addressData.msg, async () => {
        window.location.reload();
      });
    } else if (addressData.status === 400) {
      addresses = [];
    } else if (addressData.status === 200) {
      const level = addressData.level;
      await openSession(level);
      addresses = [...addressData.listAddress];
    }
  } catch (error) {
    console.error('Erro ao buscar dados de endereço:', error);
    showModalAlert('Alert', 'Erro de Conexão!', error.message, closeModal);
    return;
  }

  if (addresses.length === 0) {
    showModalAlert(
      'Next',
      'Nenhum Endereço cadastrado!',
      'Cadastre o endereço do local do serviço.',
      async () => {
        localStorage.setItem(
          'returnModal',
          JSON.stringify({
            type: 'newRequest',
            data: null,
          })
        );
        await newAddress();
        closeModalRegister();
      }
    );
  }

  title.textContent = 'Solicitar Serviço';
  content.innerHTML = `
      <div class="form-content">
        <div class="form-center">
          <label class="label">Endereço do Serviço:</label>
          <select id="select-address" class="select">
            <option value="">Selecione o Endereço</option>
            ${addresses
              .map(
                (address) =>
                  `<option value="${address._id}" data-address="${address.clientId}">
                    ${address.addressType} - ${address.street}, Nº${address.number} - Comp: ${address.complement}
                  </option>`
              )
              .join('')}
          </select>
          <label class="label">Ou cadastre novo endereço</label>
          <button type="button" id="newAddressBtn" class="modal-content-btn-enter">NOVO</button>
        <div class="form-center">
          <label class="label">Ambiente do Serviço:</label>
          </div> <div class="form-group">
            <input class="form-group-input" type="text" id="envName" required>
            <label class="form-group-label" for="">Nome do Ambiente:</label>
            ${formGroupPort}
          </div>
        </div>
        <div id="divServiceType" class="form-center">
          <label class="label">Tipo de Serviço:</label>
          <div class="radio-container">
            <label class="label">
              <input type="radio" class="radio" name="request-type" value="Instalação">
              <span class="span">Instalação</span>
            </label>
            <label class="label">
              <input type="radio" class="radio" name="request-type" value="Manutenção">
              <span class="span">Manutenção</span>
            </label>
          </div>
        </div>      
        <div id="description-container" class="hidden">        
          <label class="label">Selecione o(s) problema(s):</label>
          <div class="data-items">
            <label class="label">
              <input type="checkbox" class="checkbox" class="checkbox" name="problem" value="Não refrigera">
              <span class="span">Não refrigera</span>
            </label>
            <label class="label">
              <input type="checkbox" class="checkbox" class="checkbox" name="problem" value="Barulho anormal">
              <span class="span">Barulho anormal</span>
            </label>
            <label class="label">
              <input type="checkbox" class="checkbox" class="checkbox" name="problem" value="Vazamentos">
              <span class="span">Vazamentos</span>
            </label>
            <label class="label">
              <input type="checkbox" class="checkbox" class="checkbox" name="problem" value="Mal cheiro">
              <span class="span">Mal cheiro</span>
            </label>
          </div>
        </div>
        <div id="equipment-container" class="hidden">
          <label class="label">Equipamento para Instalação:</label>
          <div class="data-items">
            <label class="label">
              <input type="radio" class="radio" name="equipment" value="Possuo Equipamento">
              <span class="span">Já possuo Equipamento</span>
            </label>
            <label class="label">
              <input type="radio" class="radio" name="equipment" value="Equipamento Novo">
              <span class="span">Acrescentar Equipamento Novo</span>
            </label>
            <label class="label">
              <input type="radio" class="radio" name="equipment" value="Recondicionado pela GTA">
              <span class="span">Recondicionado pela GTA</span>
            </label>
          </div>
        </div>
      </div>
    `;

  footer.innerHTML = `
      <div class="modal-user-footer">
        <button type="button" id="saveRequest" class="modal-content-btn-ok"> Enviar </button>
      </div>
    `;

  btnClose.onclick = async function () {
    closeModalRegister();
  };

  modal.style.display = 'block';

  document
    .getElementById('newAddressBtn')
    .addEventListener('click', async () => {
      localStorage.setItem(
        'returnModal',
        JSON.stringify({
          type: 'newRequest',
          data: null,
        })
      );
      await newAddress();
      closeModalRegister();
    });

  function toggleVisibilityBasedOnServiceType() {
    const requestTypeInputs = document.querySelectorAll(
      'input[name="request-type"]'
    );
    const descriptionContainer = document.getElementById(
      'description-container'
    );
    const equipmentContainer = document.getElementById('equipment-container');
    requestTypeInputs.forEach((input) => {
      input.addEventListener('change', () => {
        if (input.value === 'Manutenção' && input.checked) {
          descriptionContainer.classList.remove('hidden');
          descriptionContainer.classList.add('form-center');
          equipmentContainer.classList.remove('form-center');
          equipmentContainer.classList.add('hidden');
          clearEquipmentSelection();
        } else if (input.value === 'Instalação' && input.checked) {
          equipmentContainer.classList.remove('hidden');
          equipmentContainer.classList.add('form-center');
          descriptionContainer.classList.remove('form-center');
          descriptionContainer.classList.add('hidden');
          clearCheckboxSelection();
        }
      });
    });
  }

  function clearCheckboxSelection() {
    const problemCheckboxes = document.querySelectorAll(
      'input[name="problem"]'
    );
    problemCheckboxes.forEach((checkbox) => (checkbox.checked = false));
  }

  function clearEquipmentSelection() {
    const equipmentRadios = document.querySelectorAll(
      'input[name="equipment"]'
    );
    equipmentRadios.forEach((radio) => (radio.checked = false));
  }

  toggleVisibilityBasedOnServiceType();

  document.getElementById('saveRequest').addEventListener('click', async () => {
    const selectElement = document.getElementById('select-address');
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const address = selectedOption.value;
    const dataAddress = selectedOption.getAttribute('data-address');
    const environment = document.getElementById('envName');
    const status = 'Pendente';
    const data = {};

    if (address.value === '') {
      showModalAlert(
        'Alert',
        'Endereço para Serviço',
        'Por favor, selecione um endereço cadastrado.',
        closeModal
      );
      return;
    }

    if (environment.value === '') {
      showModalAlert(
        'Alert',
        'Nome do Ambiente',
        'Por favor, digite um nome para o ambiente do serviço. (Ex.: sala, quarto1, sala202...).',
        closeModal
      );
      return;
    }

    const serviceTypeInput = document.querySelector(
      'input[name="request-type"]:checked'
    );

    const serviceType = serviceTypeInput ? serviceTypeInput.value : '';

    if (serviceType === 'Manutenção') {
      const serviceDescription = Array.from(
        document.querySelectorAll('input[name="problem"]:checked')
      )
        .map((checkbox) => checkbox.value)
        .join(', ');

      if (!serviceDescription) {
        showModalAlert(
          'Alert',
          'Selecione Problemas',
          'Por favor, marque pelo menos um problema em seu equipamento.',
          closeModal
        );
        return;
      }
      data.maintenanceProblem = serviceDescription;
    }

    if (serviceType === 'Instalação') {
      const equipmentInput = document.querySelector(
        'input[name="equipment"]:checked'
      );
      if (!equipmentInput) {
        showModalAlert(
          'Alert',
          'Equipamento',
          'Por favor, selecione uma opção de equipamento para instalação.',
          closeModal
        );
        return;
      }
      data.installationEquipment = equipmentInput.value;
    }

    if (!serviceType) {
      showModalAlert(
        'Alert',
        'Tipo de Serviço',
        'Marque o tipo de serviço.',
        closeModal
      );
      return;
    }

    data.clientId = dataAddress;
    data.addressId = address;
    data.envName = environment.value;
    data.requestType = serviceType;
    data.requestStatus = status;

    try {
      const requestData = await registerRequest(data);
      if (requestData.status === 401) {
        showModalAlert('Next', requestData.title, requestData.msg, async () => {
          await exitSession();
        });
      } else if (
        requestData.status === 400 ||
        requestData.status === 409 ||
        requestData.status === 500
      ) {
        showModalAlert('Alert', requestData.title, requestData.msg, closeModal);
      } else if (requestData.status === 201) {
        const level = requestData.level;
        showModalAlert('Next', requestData.title, requestData.msg, async () => {
          await openSession(level);
          await modalListRequest();
        });
      }
    } catch (error) {
      showModalAlert('Erro de Conexão', error.message, closeModal);
    }
  });
}
