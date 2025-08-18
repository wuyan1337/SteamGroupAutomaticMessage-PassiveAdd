// ==UserScript==
// @name         Steam被动扩列引流脚本
// @namespace    https://example.com/
// @version      1.1
// @author       无言QQ1730249
// @description  在 Steam 群组页面：当评论框为空时自动填充预设文本，并自动发送，可单独/配套使用
// @match        https://steamcommunity.com/groups/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // ==== 配置区 ====
  const TEXT = 'https://steamcommunity.com/id/wuyan1337/ ';      //改为你想要发送的内容
  const AUTO_SEND = true;          // 是否自动点击发送
  const SEND_DELAY_MS = 600;       // 填充后多久点击发送（给站内监听器反应的时间）
  // ================

  function fillOnce(textarea) {
    if (!textarea || textarea.dataset._filledByUserscript) return;

    const isEmpty = !textarea.value || textarea.value.trim() === '';
    if (!isEmpty) return;

    textarea.value = TEXT;

    ['input', 'change', 'keyup'].forEach(type => {
      textarea.dispatchEvent(new Event(type, { bubbles: true }));
    });

    textarea.dataset._filledByUserscript = '1';

    if (AUTO_SEND) {
      setTimeout(() => tryClickSubmit(textarea), SEND_DELAY_MS);
    }
  }

  function tryClickSubmit(textarea) {
    if (!textarea || textarea.dataset._autoSentByUserscript) return;

    const root =
      textarea.closest('.commentthread_entry') ||
      textarea.closest('form') ||
      textarea.parentElement ||
      document;
    const btn =
      root.querySelector('[id^="commentthread_"][id$="_submit"]') ||
      root.querySelector('.commentthread_submit, .commentthread_submit_button') ||
      root.querySelector('.btn_green_white_innerfade[id*="_submit"]') ||
      root.querySelector('span[role="button"].btn_green_white_innerfade');

    if (!btn) return;

    const disabled = btn.hasAttribute('disabled') || btn.classList.contains('disabled');
    if (disabled) {
      setTimeout(() => {
        const stillDisabled = btn.hasAttribute('disabled') || btn.classList.contains('disabled');
        if (!stillDisabled) safeClick(btn, textarea);
      }, 300);
      return;
    }

    safeClick(btn, textarea);
  }

  function safeClick(btn, textarea) {
    try {
      btn.click();
      textarea.dataset._autoSentByUserscript = '1';
    } catch (e) {
      const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
      btn.dispatchEvent(ev);
      textarea.dataset._autoSentByUserscript = '1';
    }
  }
  function scanAndFill(root = document) {
    const nodes = root.querySelectorAll(
      [
        'textarea.commentthread_textarea',
        'textarea[id*="commentthread_"][id$="_textarea"]',
        'textarea[name*="commentthread_"][name$="_textarea"]'
      ].join(',')
    );
    nodes.forEach(fillOnce);
  }

  scanAndFill();

  const mo = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length) {
        m.addedNodes.forEach(n => {
          if (n.nodeType !== 1) return;
          if (n.matches?.('textarea') || n.querySelector?.('textarea')) {
            scanAndFill(n);
          }
        });
      }
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', () => setTimeout(scanAndFill, 800));
})();
