
function pegarUsuarios() {
  let texto = localStorage.getItem('usuarios');
  if (texto === null) {
    return [];
  }
  return JSON.parse(texto);
}

function salvarUsuarios(lista) {
  localStorage.setItem('usuarios', JSON.stringify(lista));
}

function buscarUsuario(email) {
  let usuarios = pegarUsuarios();
  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].email === email) {
      return usuarios[i];
    }
  }
  return null;
}

function pegarUsuarioLogado() {
  return buscarUsuario(localStorage.getItem('usuarioLogado'));
}


function criarMensagem(botao) {
  let paragrafo = document.createElement('p');
  paragrafo.className = 'mensagem-erro';
  botao.parentNode.insertBefore(paragrafo, botao);
  return paragrafo;
}


function temCaractereEspecial(senha) {
  return /[^A-Za-z0-9À-ÿ\s]/.test(senha);
}


/* === CADASTRO === */

let botaoOlho = document.getElementById('olho-magico');

if (botaoOlho) {
  let campoNome = document.getElementById('nome-completo');
  let campoEmail = document.getElementById('email-institucional');
  let campoSenha = document.getElementById('digite-sua-senha');
  let campoTermos = document.getElementById('check-termos');
  let botaoCadastrar = document.querySelector('.botao-entrar-cadastrar');
  let requisitos = document.querySelectorAll('.requisitos-senha li');
  let mensagemCadastro = criarMensagem(botaoCadastrar);

  
  botaoOlho.addEventListener('click', function () {
    if (campoSenha.type === 'password') {
      campoSenha.type = 'text';
    } else {
      campoSenha.type = 'password';
    }
    botaoOlho.classList.toggle('visivel');
  });

  
  campoSenha.addEventListener('input', function () {
    let senha = campoSenha.value;
    requisitos[0].classList.toggle('atendido', senha.length >= 8);
    requisitos[1].classList.toggle('atendido', temCaractereEspecial(senha));
    requisitos[2].classList.toggle('atendido', /[0-9]/.test(senha));
  });

  
  document.getElementById('abrir-modal').addEventListener('click', function (evento) {
    evento.preventDefault();
    window.open('termos-de-uso.html', '_blank');
  });

 
  campoTermos.addEventListener('change', function () {
    campoTermos.setCustomValidity('');
  });

  botaoCadastrar.addEventListener('click', function (evento) {
    evento.preventDefault();
    mensagemCadastro.textContent = '';

    let nome = campoNome.value.trim();
    let email = campoEmail.value.trim().toLowerCase();
    let senha = campoSenha.value;

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

    
    let faltando = [];
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

    if (!campoTermos.checked) {
      campoTermos.setCustomValidity('Aceite os termos de uso.');
      campoTermos.reportValidity();
      return;
    }

    let usuarios = pegarUsuarios();
    usuarios.push({ nome: nome, email: email, senha: senha });
    salvarUsuarios(usuarios);
    localStorage.setItem('usuarioLogado', email);
    window.location.href = 'personalizacao.html';
  });
}


/* === LOGIN === */

let formularioLogin = document.querySelector('.formulario-login');

if (formularioLogin) {
  let loginEmail = formularioLogin.querySelector('input[name="email"]');
  let loginSenha = formularioLogin.querySelector('input[name="senha"]');
  let botaoEntrar = formularioLogin.querySelector('.botao-entrar-cadastrar');
  let mensagemLogin = criarMensagem(botaoEntrar);

  botaoEntrar.addEventListener('click', function () {
    let email = loginEmail.value.trim().toLowerCase();
    let usuario = buscarUsuario(email);

    if (email === '' || loginSenha.value === '') {
      mensagemLogin.textContent = 'Preencha o e-mail e a senha.';
    } else if (usuario === null || usuario.senha !== loginSenha.value) {
      mensagemLogin.textContent = 'E-mail ou senha incorretos.';
    } else {
      localStorage.setItem('usuarioLogado', email);
      window.location.href = 'tela-carregamento.html';
    }
  });

  formularioLogin.addEventListener('keydown', function (evento) {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      botaoEntrar.click();
    }
  });
}


/* === PÓS-CARREGAMENTO === */

let bannerVagas = document.querySelector('.banner-vagas');

if (bannerVagas) {
  let usuarioInicio = pegarUsuarioLogado();
  let quantidade = document.querySelectorAll('.bloco-vagas').length;

  if (usuarioInicio) {
    bannerVagas.querySelector('.titulo-banner').textContent = 'Olá, ' + usuarioInicio.nome.split(' ')[0] + '.';
  }
  bannerVagas.querySelector('.subtitulo-banner').textContent = 'Você possui ' + quantidade + ' vagas compatíveis.';
}


/* === VAGAS DETALHADAS === */

let painelVaga = document.querySelector('.coluna-detalhes');

if (painelVaga) {
  let cartoes = document.querySelectorAll('.cartao-vaga:not(.cartao-vazio)');

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

      let porcentagem = parseInt(cartao.querySelector('.texto-compatibilidade').textContent, 10);
      let anel = painelVaga.querySelector('.bloco-compatibilidade .anel-compatibilidade');
      let anelDoCartao = cartao.querySelector('.anel-compatibilidade');

      anel.style.setProperty('--porcentagem', porcentagem);
      anel.querySelector('.texto-compatibilidade').textContent = porcentagem + '%';
      anel.classList.toggle('compat-media', anelDoCartao.classList.contains('compat-media'));
    });
  });
}


/* === PERFIL === */

let fotoPerfil = document.getElementById('foto-preview');

if (fotoPerfil) {
  let seletorFoto = document.getElementById('selecao-arquivo');
  let usuarioPerfil = pegarUsuarioLogado();
  let chaveFoto = 'foto-visitante';

  if (usuarioPerfil) {
    document.querySelector('.nome-completo').textContent = usuarioPerfil.nome;
    chaveFoto = 'foto-' + usuarioPerfil.email;
  }

  if (usuarioPerfil && usuarioPerfil.perfil) {
    let dados = usuarioPerfil.perfil;
    let linhas = document.querySelectorAll('.dados-perfil span');
    let blocoHabilidades = document.querySelector('.habilidades');
    let caixaHabilidades = document.createElement('div');

    linhas[0].textContent = 'Instituição: ' + dados.instituicao;
    linhas[1].textContent = 'Curso: ' + dados.curso;
    linhas[2].textContent = 'Semestre: ' + dados.semestre;

    caixaHabilidades.className = 'caixa-itens-perfil';
    dados.habilidades.forEach(function (nome) {
      let tag = document.createElement('span');
      tag.className = 'tag-perfil';
      tag.textContent = nome;
      caixaHabilidades.appendChild(tag);
    });
    blocoHabilidades.classList.add('preenchido');
    blocoHabilidades.appendChild(caixaHabilidades);
  }

  if (localStorage.getItem(chaveFoto)) {
    fotoPerfil.src = localStorage.getItem(chaveFoto);
  }

  seletorFoto.addEventListener('change', function () {
    if (seletorFoto.files.length === 0) {
      return;
    }
    let leitor = new FileReader();
    leitor.onload = function () {
      fotoPerfil.src = leitor.result;
      localStorage.setItem(chaveFoto, leitor.result);
    };
    leitor.readAsDataURL(seletorFoto.files[0]);
  });
}


/* === PERSONALIZAÇÃO === */

let sliderPersonalizacao = document.getElementById('slider-wrapper');
let nomesDosAnexos = [];

function adicionarHabilidade() {
  let campo = document.getElementById('tags-habilidades');
  let texto = campo.value.trim();
  campo.value = '';

  if (texto === '') {
    return;
  }

  let caixa = document.querySelector('.container-tags');
  let tag = document.createElement('span');
  tag.className = 'tag-habilidade';
  tag.setAttribute('data-nome', texto);
  tag.textContent = texto + ' ×';
  tag.addEventListener('click', function () {
    caixa.removeChild(tag);
  });
  caixa.insertBefore(tag, campo.parentNode);
}

function guardarArquivos(arquivos) {
  let lista = document.getElementById('lista-ficheiros');

  for (let i = 0; i < arquivos.length; i++) {
    if (nomesDosAnexos.indexOf(arquivos[i].name) === -1) {
      let item = document.createElement('li');
      item.className = 'estilizacao-ficheiro';
      item.textContent = arquivos[i].name;
      lista.appendChild(item);
      nomesDosAnexos.push(arquivos[i].name);
    }
  }
}

if (sliderPersonalizacao) {
  let selectInstituicao = document.getElementById('instituicao');
  let selectCurso = document.getElementById('curso');
  let botoesSemestre = document.querySelectorAll('.botao-semestre');
  let botaoContinuar = document.querySelector('.etapa-form .botao-continuar');
  let campoAnexo = document.getElementById('campo-anexo');
  let areaUpload = document.querySelector('.area-upload');
  let mensagemEtapa1 = criarMensagem(botaoContinuar);

  document.getElementById('lista-ficheiros').textContent = '';

  botoesSemestre.forEach(function (botao) {
    botao.addEventListener('click', function () {
      botoesSemestre.forEach(function (outro) {
        outro.classList.remove('selecionado');
      });
      botao.classList.add('selecionado');
    });
  });

  document.getElementById('tags-habilidades').addEventListener('keydown', function (evento) {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      adicionarHabilidade();
    }
  });

  botaoContinuar.addEventListener('click', function (evento) {
    adicionarHabilidade(); // caso tenha sobrado algo digitado
    mensagemEtapa1.textContent = '';

    let erro = '';
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
      evento.preventDefault();
      mensagemEtapa1.textContent = erro;
    }
  });

  campoAnexo.addEventListener('change', function () {
    guardarArquivos(campoAnexo.files);
    campoAnexo.value = '';
  });

  areaUpload.addEventListener('dragover', function (evento) {
    evento.preventDefault();
  });
  areaUpload.addEventListener('drop', function (evento) {
    evento.preventDefault();
    guardarArquivos(evento.dataTransfer.files);
  });

  document.getElementById('btn-finalizar').addEventListener('click', function (evento) {
    evento.preventDefault();

    let habilidades = [];
    document.querySelectorAll('.tag-habilidade').forEach(function (tag) {
      habilidades.push(tag.getAttribute('data-nome'));
    });

    let usuarios = pegarUsuarios();
    let emailLogado = localStorage.getItem('usuarioLogado');

    for (let i = 0; i < usuarios.length; i++) {
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