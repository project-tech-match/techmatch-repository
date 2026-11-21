/* ===== FUNÇÕES AUXILIARES ===== */

function pegarUsuarios() {
  var texto = localStorage.getItem('usuarios');
  if (texto === null) {
    return [];
  }
  return JSON.parse(texto);
}

function salvarUsuarios(lista) {
  localStorage.setItem('usuarios', JSON.stringify(lista));
}

// Procura um usuário pelo e-mail (devolve null se não achar)
function buscarUsuario(email) {
  var usuarios = pegarUsuarios();
  for (var i = 0; i < usuarios.length; i++) {
    if (usuarios[i].email === email) {
      return usuarios[i];
    }
  }
  return null;
}

function pegarUsuarioLogado() {
  return buscarUsuario(localStorage.getItem('usuarioLogado'));
}

// Cria um parágrafo de mensagem acima do botão e devolve esse parágrafo
function criarMensagem(botao) {
  var paragrafo = document.createElement('p');
  paragrafo.className = 'mensagem-erro';
  botao.parentNode.insertBefore(paragrafo, botao);
  return paragrafo;
}

// A senha tem algum caractere que não é letra, número ou espaço?
function temCaractereEspecial(senha) {
  return /[^A-Za-z0-9À-ÿ\s]/.test(senha);
}


/* ===== CADASTRO ===== */

var botaoOlho = document.getElementById('olho-magico');

if (botaoOlho) {
  var campoNome = document.getElementById('nome-completo');
  var campoEmail = document.getElementById('email-institucional');
  var campoSenha = document.getElementById('digite-sua-senha');
  var campoTermos = document.getElementById('check-termos');
  var botaoCadastrar = document.querySelector('.botao-entrar-cadastrar');
  var requisitos = document.querySelectorAll('.requisitos-senha li');
  var mensagemCadastro = criarMensagem(botaoCadastrar);

  // Olho mágico: mostra e esconde a senha
  botaoOlho.addEventListener('click', function () {
    if (campoSenha.type === 'password') {
      campoSenha.type = 'text';
    } else {
      campoSenha.type = 'password';
    }
    botaoOlho.classList.toggle('visivel');
  });

  // Enquanto digita, pinta de verde os requisitos cumpridos
  campoSenha.addEventListener('input', function () {
    var senha = campoSenha.value;
    requisitos[0].classList.toggle('atendido', senha.length >= 8);
    requisitos[1].classList.toggle('atendido', temCaractereEspecial(senha));
    requisitos[2].classList.toggle('atendido', /[0-9]/.test(senha));
  });

  // Link "termos de uso": abre a página dos termos em outra aba
  document.getElementById('abrir-modal').addEventListener('click', function (evento) {
    evento.preventDefault();
    window.open('termos-de-uso.html', '_blank');
  });

  // Ao marcar a caixinha, o balão de aviso some
  campoTermos.addEventListener('change', function () {
    campoTermos.setCustomValidity('');
  });

  // Botão Cadastrar
  botaoCadastrar.addEventListener('click', function (evento) {
    evento.preventDefault(); // primeiro confere tudo, depois segue
    mensagemCadastro.textContent = '';

    var nome = campoNome.value.trim();
    var email = campoEmail.value.trim().toLowerCase();
    var senha = campoSenha.value;

    if (nome.indexOf(' ') === -1) {
      mensagemCadastro.textContent = 'Conta não criada: digite seu nome completo.';
      return;
    }

    if (email.indexOf('@') === -1 || email.indexOf('.') === -1) {
      mensagemCadastro.textContent = 'Conta não criada: digite um e-mail válido.';
      return;
    }

    if (buscarUsuario(email) !== null) {
      mensagemCadastro.textContent = 'Conta não criada: este e-mail já está cadastrado.';
      return;
    }

    // Senha: guarda o que está faltando
    var faltando = [];
    if (senha.length < 8) {
      faltando.push('no mínimo 8 caracteres');
    }
    if (!temCaractereEspecial(senha)) {
      faltando.push('pelo menos um caractere especial');
    }
    if (!/[0-9]/.test(senha)) {
      faltando.push('pelo menos um número');
    }
    if (faltando.length > 0) {
      mensagemCadastro.textContent = 'Conta não criada: a senha precisa ter ' + faltando.join(', ') + '.';
      return;
    }

    // Termos de uso: mostra o balão "Aceite os termos de uso."
    if (!campoTermos.checked) {
      campoTermos.setCustomValidity('Aceite os termos de uso.');
      campoTermos.reportValidity();
      return;
    }

    // Tudo certo: salva e vai para a próxima página
    var usuarios = pegarUsuarios();
    usuarios.push({ nome: nome, email: email, senha: senha });
    salvarUsuarios(usuarios);
    localStorage.setItem('usuarioLogado', email);
    window.location.href = 'personalizacao.html';
  });
}


/* ===== LOGIN ===== */

var formularioLogin = document.querySelector('.formulario-login');

if (formularioLogin) {
  var loginEmail = formularioLogin.querySelector('input[name="email"]');
  var loginSenha = formularioLogin.querySelector('input[name="senha"]');
  var botaoEntrar = formularioLogin.querySelector('.botao-entrar-cadastrar');
  var mensagemLogin = criarMensagem(botaoEntrar);

  botaoEntrar.addEventListener('click', function () {
    var email = loginEmail.value.trim().toLowerCase();
    var usuario = buscarUsuario(email);

    if (email === '' || loginSenha.value === '') {
      mensagemLogin.textContent = 'Preencha o e-mail e a senha.';
    } else if (usuario === null || usuario.senha !== loginSenha.value) {
      mensagemLogin.textContent = 'E-mail ou senha incorretos.';
    } else {
      localStorage.setItem('usuarioLogado', email);
      window.location.href = 'tela-carregamento.html';
    }
  });

  // Apertar Enter é o mesmo que clicar em Entrar
  formularioLogin.addEventListener('keydown', function (evento) {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      botaoEntrar.click();
    }
  });
}


/* ===== PÓS-CARREGAMENTO ===== */

var bannerVagas = document.querySelector('.banner-vagas');

if (bannerVagas) {
  var usuarioInicio = pegarUsuarioLogado();
  var quantidade = document.querySelectorAll('.bloco-vagas').length;

  if (usuarioInicio) {
    bannerVagas.querySelector('.titulo-banner').textContent = 'Olá, ' + usuarioInicio.nome.split(' ')[0] + '.';
  }
  bannerVagas.querySelector('.subtitulo-banner').textContent = 'Você possui ' + quantidade + ' vagas compatíveis.';
}


/* ===== VAGAS DETALHADAS ===== */

var painelVaga = document.querySelector('.coluna-detalhes');

if (painelVaga) {
  var cartoes = document.querySelectorAll('.cartao-vaga:not(.cartao-vazio)');

  // Clicar em um cartão mostra essa vaga no painel da direita
  cartoes.forEach(function (cartao) {
    cartao.addEventListener('click', function () {
      cartoes.forEach(function (outro) {
        outro.classList.remove('selecionada');
      });
      cartao.classList.add('selecionada');

      painelVaga.querySelector('.titulo-detalhe').textContent =
        cartao.querySelector('.titulo-cartao-vaga').textContent;
      painelVaga.querySelector('.detalhes-iniciais .empresa-cartao-vaga').textContent =
        cartao.querySelector('.empresa-cartao-vaga').textContent;

      var porcentagem = parseInt(cartao.querySelector('.texto-compatibilidade').textContent, 10);
      var anel = painelVaga.querySelector('.bloco-compatibilidade .anel-compatibilidade');
      var anelDoCartao = cartao.querySelector('.anel-compatibilidade');

      anel.style.setProperty('--porcentagem', porcentagem);
      anel.querySelector('.texto-compatibilidade').textContent = porcentagem + '%';
      anel.classList.toggle('compat-media', anelDoCartao.classList.contains('compat-media'));
    });
  });
}


/* ===== PERFIL ===== */

var fotoPerfil = document.getElementById('foto-preview');

if (fotoPerfil) {
  var seletorFoto = document.getElementById('selecao-arquivo');
  var usuarioPerfil = pegarUsuarioLogado();
  var chaveFoto = 'foto-visitante';

  if (usuarioPerfil) {
    document.querySelector('.nome-completo').textContent = usuarioPerfil.nome;
    chaveFoto = 'foto-' + usuarioPerfil.email;
  }

  // Dados preenchidos na página de personalização
  if (usuarioPerfil && usuarioPerfil.perfil) {
    var dados = usuarioPerfil.perfil;
    var linhas = document.querySelectorAll('.dados-perfil span');
    var blocoHabilidades = document.querySelector('.habilidades');
    var caixaHabilidades = document.createElement('div');

    linhas[0].textContent = 'Instituição: ' + dados.instituicao;
    linhas[1].textContent = 'Curso: ' + dados.curso;
    linhas[2].textContent = 'Semestre: ' + dados.semestre;

    caixaHabilidades.className = 'caixa-itens-perfil';
    dados.habilidades.forEach(function (nome) {
      var tag = document.createElement('span');
      tag.className = 'tag-perfil';
      tag.textContent = nome;
      caixaHabilidades.appendChild(tag);
    });
    blocoHabilidades.classList.add('preenchido');
    blocoHabilidades.appendChild(caixaHabilidades);
  }

  // Mostra a foto salva, se existir
  if (localStorage.getItem(chaveFoto)) {
    fotoPerfil.src = localStorage.getItem(chaveFoto);
  }

  // Ao escolher uma imagem, mostra e salva
  seletorFoto.addEventListener('change', function () {
    if (seletorFoto.files.length === 0) {
      return;
    }
    var leitor = new FileReader();
    leitor.onload = function () {
      fotoPerfil.src = leitor.result;
      localStorage.setItem(chaveFoto, leitor.result);
    };
    leitor.readAsDataURL(seletorFoto.files[0]);
  });
}


/* ===== PERSONALIZAÇÃO ===== */

var sliderPersonalizacao = document.getElementById('slider-wrapper');
var nomesDosAnexos = [];

// Transforma o que foi digitado em uma tag (clique na tag para remover)
function adicionarHabilidade() {
  var campo = document.getElementById('tags-habilidades');
  var texto = campo.value.trim();
  campo.value = '';

  if (texto === '') {
    return;
  }

  var caixa = document.querySelector('.container-tags');
  var tag = document.createElement('span');
  tag.className = 'tag-habilidade';
  tag.setAttribute('data-nome', texto);
  tag.textContent = texto + ' ×';
  tag.addEventListener('click', function () {
    caixa.removeChild(tag);
  });
  caixa.insertBefore(tag, campo.parentNode);
}

// Coloca os arquivos escolhidos na lista da tela
function guardarArquivos(arquivos) {
  var lista = document.getElementById('lista-ficheiros');

  for (var i = 0; i < arquivos.length; i++) {
    if (nomesDosAnexos.indexOf(arquivos[i].name) === -1) {
      var item = document.createElement('li');
      item.className = 'estilizacao-ficheiro';
      item.textContent = arquivos[i].name;
      lista.appendChild(item);
      nomesDosAnexos.push(arquivos[i].name);
    }
  }
}

if (sliderPersonalizacao) {
  var selectInstituicao = document.getElementById('instituicao');
  var selectCurso = document.getElementById('curso');
  var botoesSemestre = document.querySelectorAll('.botao-semestre');
  var botaoContinuar = document.querySelector('.etapa-form .botao-continuar');
  var campoAnexo = document.getElementById('campo-anexo');
  var areaUpload = document.querySelector('.area-upload');
  var mensagemEtapa1 = criarMensagem(botaoContinuar);

  // A lista de anexos começa vazia (o HTML traz um exemplo)
  document.getElementById('lista-ficheiros').textContent = '';

  // Semestre: só um botão fica selecionado
  botoesSemestre.forEach(function (botao) {
    botao.addEventListener('click', function () {
      botoesSemestre.forEach(function (outro) {
        outro.classList.remove('selecionado');
      });
      botao.classList.add('selecionado');
    });
  });

  // Habilidades: Enter cria a tag
  document.getElementById('tags-habilidades').addEventListener('keydown', function (evento) {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      adicionarHabilidade();
    }
  });

  // Continuar: só passa para a etapa 2 se tudo estiver preenchido
  botaoContinuar.addEventListener('click', function (evento) {
    adicionarHabilidade(); // caso tenha sobrado algo digitado
    mensagemEtapa1.textContent = '';

    var erro = '';
    if (selectInstituicao.value === '') {
      erro = 'Selecione sua instituição.';
    } else if (selectCurso.value === '') {
      erro = 'Selecione seu curso.';
    } else if (document.querySelector('.botao-semestre.selecionado') === null) {
      erro = 'Selecione seu semestre.';
    } else if (document.querySelectorAll('.tag-habilidade').length === 0) {
      erro = 'Adicione pelo menos uma habilidade.';
    }

    if (erro !== '') {
      evento.preventDefault(); // não deixa trocar de etapa
      mensagemEtapa1.textContent = erro;
    }
  });

  // Anexos: clicar para escolher
  campoAnexo.addEventListener('change', function () {
    guardarArquivos(campoAnexo.files);
    campoAnexo.value = '';
  });

  // Anexos: arrastar e soltar
  areaUpload.addEventListener('dragover', function (evento) {
    evento.preventDefault();
  });
  areaUpload.addEventListener('drop', function (evento) {
    evento.preventDefault();
    guardarArquivos(evento.dataTransfer.files);
  });

  // Ativar Ferramenta: salva o perfil e vai para o carregamento
  document.getElementById('btn-finalizar').addEventListener('click', function (evento) {
    evento.preventDefault();

    var habilidades = [];
    document.querySelectorAll('.tag-habilidade').forEach(function (tag) {
      habilidades.push(tag.getAttribute('data-nome'));
    });

    var usuarios = pegarUsuarios();
    var emailLogado = localStorage.getItem('usuarioLogado');

    for (var i = 0; i < usuarios.length; i++) {
      if (usuarios[i].email === emailLogado) {
        usuarios[i].perfil = {
          instituicao: selectInstituicao.value,
          curso: selectCurso.options[selectCurso.selectedIndex].text,
          semestre: document.querySelector('.botao-semestre.selecionado').textContent,
          habilidades: habilidades,
          anexos: nomesDosAnexos
        };
      }
    }

    salvarUsuarios(usuarios);
    window.location.href = 'tela-carregamento.html';
  });
}