/* =========================================================
   BLOODHEX Executor — interações do site
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Configuração ----------
     Links de download de cada plataforma.
     Apontam para o gate de login (login.html) antes do arquivo real.
     Depois do login, o login.html entrega o arquivo via DOWNLOAD_URL. */
  const DOWNLOAD_LINKS = {
    windows: "login.html?p=Windows",
    android: "login.html?p=Android",
    ios: "login.html?p=iOS"
  };

  /* ---------- Ano no rodapé ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header com scroll ---------- */
  const header = document.getElementById("header");
  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  const closeNav = () => {
    if (!nav || !burger) return;
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  };

  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Toast ---------- */
  let toastEl = null;
  let toastTimer = null;

  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    // reinicia a animação
    toastEl.classList.remove("is-visible");
    void toastEl.offsetWidth;
    toastEl.classList.add("is-visible");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2600);
  }

  /* ---------- Botões de download ---------- */
  const PLATFORM_NAMES = {
    windows: "Windows",
    android: "Android",
    ios: "iPhone (iOS)"
  };

  const downloadButtons = document.querySelectorAll("#hero-download, #nav-download, [data-download]");

  downloadButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // data-download pode ser "windows" / "android" / "ios".
      // Botões antigos com data-download vazio caem para windows.
      const raw = (btn.getAttribute("data-download") || "").trim().toLowerCase();
      const platform = PLATFORM_NAMES[raw] ? raw : "windows";
      const url = DOWNLOAD_LINKS[platform];

      if (url === "#" || !url) {
        e.preventDefault();
        toast("Download para " + PLATFORM_NAMES[platform] + " ainda não configurado.");
        return;
      }
      btn.setAttribute("href", url);
      btn.setAttribute("target", "_blank");
      btn.setAttribute("rel", "noopener noreferrer");
      // deixa o href seguir normalmente
    });
  });

  /* ---------- Copiar script ---------- */
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const code = btn.getAttribute("data-copy") || "";
      const original = btn.textContent;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(code);
        } else {
          // fallback para contextos não seguros (file://, http)
          const ta = document.createElement("textarea");
          ta.value = code;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        btn.textContent = "Copiado!";
        btn.classList.add("is-copied");
        toast("Script copiado para a área de transferência.");
      } catch (err) {
        btn.textContent = "Falhou";
        toast("Não foi possível copiar automaticamente.");
      }

      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("is-copied");
      }, 1800);
    });
  });

  /* ---------- FAQ (acordeão) ---------- */
  const faqItems = document.querySelectorAll(".faq__item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq__q");
    const answer = item.querySelector(".faq__a");
    if (!question || !answer) return;

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // fecha os outros
      faqItems.forEach((other) => {
        if (other === item) return;
        other.classList.remove("is-open");
        const otherQ = other.querySelector(".faq__q");
        const otherA = other.querySelector(".faq__a");
        if (otherQ) otherQ.setAttribute("aria-expanded", "false");
        if (otherA) otherA.style.maxHeight = null;
      });

      if (isOpen) {
        item.classList.remove("is-open");
        question.setAttribute("aria-expanded", "false");
        answer.style.maxHeight = null;
      } else {
        item.classList.add("is-open");
        question.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // recalcula a altura do FAQ aberto ao redimensionar
  window.addEventListener("resize", () => {
    const open = document.querySelector(".faq__item.is-open .faq__a");
    if (open) open.style.maxHeight = open.scrollHeight + "px";
  });

  /* ---------- Animação de entrada (reveal) ---------- */
  const revealTargets = document.querySelectorAll(
    ".card, .script-card, .dl-card, .section__head, .cta__inner, .faq__item"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }
})();
