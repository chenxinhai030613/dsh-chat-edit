window.__ModuleLoader__.load({
  id: 'dsh-chat-edit',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** Dictionary namespace owned by this plugin. */
    const NS = 'chatEdit'

    /** Required Client services. */
    const inject = ['slots', 'locale', 'remote', 'remote.session', 'sessions', 'uiWorkspace']

    /**
     * Simplified Chinese dictionary (the key-set source of truth).
     * Copy is explicit about what the branch model keeps and what it does not
     * roll back, so "edit"/"delete" never look like an in-place history rewrite.
     */
    const zh = {
      'copy': '复制',
      'copied': '已复制',
      'clock.md': '{m}月{d}日',
      'clock.ymd': '{y}年{m}月{d}日',
      'action.edit': '编辑',
      'action.editTitle': '编辑本轮提示词，并作为当前对话的新一轮发送',
      'action.delete': '删除',
      'action.deleteTitle': '删除本轮及其之后的对话（替换当前对话）',
      'unavailable': '本轮没有可编辑的提示词。',
      'edit.placeholder': '编辑提示词',
      'edit.aria': '本轮提示词',
      'edit.hint': '发送后会把修改后的提示词作为当前对话的下一轮发送；不会新建会话或分支，本轮及之前的内容保留。',
      'edit.attachments': '本轮提示词包含图片或文件附件；重新发送时只会带上文本内容。',
      'send': '发送',
      'cancel': '取消',
      'busy': '处理中…',
      'delete.title': '删除本轮及其之后的对话？',
      'delete.bodyLast': '本轮会从当前对话中移除。',
      'delete.bodyLater': '本轮及其之后的对话都会从当前对话中移除。',
      'delete.keep': '原对话会归档，不再出现在侧栏；工作区文件不会回退。',
      'delete.confirm': '删除',
      'error.empty': '提示词不能为空。',
      'error.generic': '操作失败，请重试。',
      'error.prompt': '发送修改后的提示词失败。',
      'error.fork': '创建替换会话失败。',
      'error.inbox': '清理继承的待发送消息失败。',
      'toast.archiveFailed': '原对话归档失败，侧栏可能会多出一条对话。',
      'toast.boundaryUnavailable': '无法定位本轮的删除分叉点，暂时不能删除。'
    }

    /** English dictionary, checked complete against the zh key set. */
    const en = {
      'copy': 'Copy',
      'copied': 'Copied',
      'clock.md': '{m}/{d}',
      'clock.ymd': '{y}-{m}-{d}',
      'action.edit': 'Edit',
      'action.editTitle': 'Edit this prompt and send it as the next turn of this conversation',
      'action.delete': 'Delete',
      'action.deleteTitle': 'Delete this turn and everything after it (replaces this conversation)',
      'unavailable': 'This turn has no editable prompt.',
      'edit.placeholder': 'Edit the prompt',
      'edit.aria': 'This turn’s prompt',
      'edit.hint': 'Sending adds the edited prompt as the next turn of this conversation; no new conversation or branch is created, and this turn and everything before it stay in place.',
      'edit.attachments': 'This prompt contains image or file attachments. Only its text will be resent.',
      'send': 'Send',
      'cancel': 'Cancel',
      'busy': 'Working…',
      'delete.title': 'Delete this turn and everything after it?',
      'delete.bodyLast': 'This turn is removed from this conversation.',
      'delete.bodyLater': 'This turn and everything after it are removed from this conversation.',
      'delete.keep': 'The original conversation is archived and leaves the sidebar; workspace files are not rolled back.',
      'delete.confirm': 'Delete',
      'error.empty': 'The prompt cannot be empty.',
      'error.generic': 'The operation failed. Please try again.',
      'error.prompt': 'Could not send the edited prompt.',
      'error.fork': 'Could not create the replacement conversation.',
      'error.inbox': 'Could not clear inherited pending messages.',
      'toast.archiveFailed': 'Could not archive the original conversation; the sidebar may show one extra entry.',
      'toast.boundaryUnavailable': 'Could not locate the fork point for this turn, so it cannot be deleted right now.'
    }

    /* ------------------------------------------------------------------ */
    /* Styles                                                              */
    /* ------------------------------------------------------------------ */

    const CSS = `
.dshChatEdit_userRow{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.dshChatEdit_actions{height:calc(28px + var(--dsh-content-font-delta,0px));display:flex;align-items:center;gap:8px}
.dshChatEdit_time{font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));color:var(--dsw-alias-label-tertiary);white-space:nowrap;padding-right:12px}
.dshChatEdit_action{width:calc(28px + var(--dsh-content-font-delta,0px));height:calc(28px + var(--dsh-content-font-delta,0px));border-radius:var(--dsw-radius-sm,6px);color:var(--dsw-alias-label-tertiary);background:0 0;border:none;display:inline-flex;align-items:center;justify-content:center;padding:6px;cursor:pointer;transition:background-color .12s,color .12s}
.dshChatEdit_action svg{width:calc(15px + var(--dsh-content-font-delta,0px));height:calc(15px + var(--dsh-content-font-delta,0px));flex:none}
.dshChatEdit_action:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12));color:var(--dsw-alias-label-secondary)}
.dshChatEdit_action:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dshChatEdit_action:disabled{opacity:.4;cursor:default}
.dshChatEdit_actionDanger:hover:not(:disabled){color:var(--dsw-alias-state-error-primary)}
@media (hover:hover){
  [data-chat-flow-kind="user"]:has(~ :is([data-chat-flow-kind="user"],[data-chat-flow-kind="steering"])) .dshChatEdit_actions{opacity:0;transition:opacity 80ms}
  [data-chat-flow-kind="user"]:has(~ :is([data-chat-flow-kind="user"],[data-chat-flow-kind="steering"])):hover .dshChatEdit_actions,
  [data-chat-flow-kind="user"]:has(~ :is([data-chat-flow-kind="user"],[data-chat-flow-kind="steering"])):focus-within .dshChatEdit_actions{opacity:1}
}
.dshChatEdit_editorCard{box-sizing:border-box;width:100%;display:flex;flex-direction:column;gap:10px;padding:12px 16px 14px;border-radius:var(--dsw-radius-xl,18px);background:var(--dsw-specific-bubble,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary)}
.dshChatEdit_textarea{box-sizing:border-box;display:block;width:100%;min-height:72px;max-height:42vh;resize:none;border:none;outline:none;background:transparent;color:inherit;font:inherit;font-size:var(--dsh-content-font-size,14px);line-height:calc(22px + var(--dsh-content-font-delta,0px));padding:0;margin:0;overflow-y:auto}
.dshChatEdit_textarea::placeholder{color:var(--dsw-alias-label-tertiary)}
.dshChatEdit_textarea:disabled{opacity:.7}
.dshChatEdit_hintRow{display:flex;align-items:flex-start;gap:6px;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(18px + var(--dsh-content-font-delta-secondary,0px));color:var(--dsw-alias-label-tertiary);text-align:left}
.dshChatEdit_hintRow svg{width:14px;height:14px;flex:none;margin-top:1px}
.dshChatEdit_confirmTitle{font-size:var(--dsh-content-font-size,14px);line-height:calc(22px + var(--dsh-content-font-delta,0px));font-weight:500;color:var(--dsw-alias-label-primary);text-align:left}
.dshChatEdit_error{font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(18px + var(--dsh-content-font-delta-secondary,0px));color:var(--dsw-alias-state-error-primary);text-align:left}
.dshChatEdit_editorFooter{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-top:2px}
.dshChatEdit_btn{box-sizing:border-box;height:34px;padding:0 16px;border-radius:var(--dsw-radius-md,8px);border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--dsh-content-font-size-secondary,13px);line-height:20px;cursor:pointer;transition:background-color .12s,filter .12s}
.dshChatEdit_btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}
.dshChatEdit_btn:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-alias-brand-primary);outline-offset:1px}
.dshChatEdit_btn:disabled{opacity:.55;cursor:default}
.dshChatEdit_btnPrimary{border-color:transparent;background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-label-primary));color:var(--dsw-alias-label-primary-foreground,var(--dsw-alias-bg-base));font-weight:500;padding:0 20px}
.dshChatEdit_btnPrimary:hover:not(:disabled){background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-label-primary));filter:brightness(1.06)}
.dshChatEdit_btnDanger{border-color:transparent;background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-foreground,#fff)}
.dshChatEdit_btnDanger:hover:not(:disabled){background:var(--dsw-alias-state-error-primary);filter:brightness(1.06)}
.dshChatEdit_fallbackBubble{background:var(--dsw-specific-bubble,var(--dsw-alias-bg-layer-2));border-radius:var(--dsw-radius-xl,18px);max-width:100%;font-size:var(--dsh-content-font-size,14px);line-height:calc(22px + var(--dsh-content-font-delta,0px));color:var(--dsw-alias-label-primary);white-space:pre-wrap;word-break:break-word;padding:10px 16px}
.dshChatEdit_toast{z-index:1300;box-sizing:border-box;max-width:min(520px,calc(100vw - 48px));padding:9px 14px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-lg,12px);background:var(--dsw-alias-bg-overlay);box-shadow:0 12px 36px rgba(0,0,0,.18);color:var(--dsw-alias-label-secondary);font-size:var(--dsh-content-font-size-secondary,13px);line-height:18px;position:fixed;left:50%;bottom:28px;transform:translateX(-50%);pointer-events:none}
@media (prefers-reduced-motion:reduce){.dshChatEdit_action,.dshChatEdit_btn{transition:none}}
`

    /* ------------------------------------------------------------------ */
    /* Small utilities                                                    */
    /* ------------------------------------------------------------------ */

    /** Observable store consumed by the slot `hooks` API. */
    function createStore(initial) {
      let state = initial
      const listeners = new Set()
      const publish = () => {
        for (const listener of [...listeners]) listener()
      }
      return {
        getSnapshot: () => state,
        subscribe(listener) {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
        set(next) {
          state = next
          publish()
        }
      }
    }

    /** Random request identity for one prompt admission. */
    function newRequestId() {
      const cryptoApi = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
      if (cryptoApi && typeof cryptoApi.randomUUID === 'function') return cryptoApi.randomUUID()
      return 'chat-edit-' + Date.now().toString(16) + '-' + Math.random().toString(16).slice(2)
    }

    /** Browser IANA zone for the prompt RPC, or undefined when unavailable. */
    function clientTimeZone() {
      try {
        const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
        return typeof zone === 'string' && zone.length > 0 ? zone : undefined
      } catch (_error) {
        return undefined
      }
    }

    /** Plain text of one content-block array. */
    function contentText(content) {
      if (!Array.isArray(content)) return ''
      const parts = []
      for (const block of content) {
        if (block && block.type === 'text' && typeof block.text === 'string') parts.push(block.text)
      }
      return parts.join('')
    }

    /** Whether one content-block array carries non-text payloads. */
    function hasNonText(content) {
      if (!Array.isArray(content)) return false
      return content.some((block) => block && block.type !== 'text')
    }

    /**
     * Split durable user content exactly the way the shipped user row does:
     * text, image/file attachments, and the remaining blocks.
     * @param content durable `data.content` blocks.
     * @returns `{text, attachments, rest}`.
     */
    function contentParts(content) {
      const texts = []
      const attachments = []
      const rest = []
      for (const block of Array.isArray(content) ? content : []) {
        const b = block
        if (b && b.type === 'text' && typeof b.text === 'string') texts.push(b.text)
        else if (b && b.type === 'image' && b.attachment !== undefined) attachments.push({ type: 'image', image: { attachment: b.attachment } })
        else if (b && b.type === 'file' && b.attachment !== undefined) attachments.push({ type: 'file', file: b.attachment })
        else rest.push(block)
      }
      return { text: texts.join(''), attachments, rest }
    }

    /** Prepared `UserContentInput` plus facts for the shared user-content Factory. */
    function prepareUserContent(data) {
      const parts = contentParts(data && data.content)
      const referenceLabels = data && Array.isArray(data.referenceLabels) ? data.referenceLabels : undefined
      const skillNames = data && data.skillNames !== undefined ? data.skillNames : undefined
      return {
        content: {
          text: parts.text,
          attachments: parts.attachments,
          extraBlocks: parts.rest,
          ...(referenceLabels === undefined ? {} : { referenceLabels })
        },
        facts: {
          ...(referenceLabels === undefined ? {} : { sessionLabels: referenceLabels }),
          ...(skillNames === undefined ? {} : { skillNames })
        }
      }
    }

    /** Zero-padded two-digit number. */
    function pad2(value) {
      return String(value).padStart(2, '0')
    }

    /** Local calendar-day start for one instant. */
    function startOfLocalDay(now) {
      const date = new Date(now)
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    }

    /** Milliseconds until the next local midnight (at least one second). */
    function msUntilNextLocalMidnight(now) {
      const next = new Date(now)
      next.setHours(24, 0, 0, 0)
      return Math.max(1000, next.getTime() - now)
    }

    /**
     * Compact local timestamp matching the shipped icon-action clock: `HH:mm`
     * for today, the `clock.md` template for earlier this year, and
     * `clock.ymd` otherwise (24-hour, zero-padded).
     */
    function formatClock(time, t, now = Date.now()) {
      if (typeof time !== 'number' || !Number.isFinite(time)) return ''
      try {
        const date = new Date(time)
        const reference = new Date(now)
        const clock = pad2(date.getHours()) + ':' + pad2(date.getMinutes())
        if (
          date.getFullYear() === reference.getFullYear() &&
          date.getMonth() === reference.getMonth() &&
          date.getDate() === reference.getDate()
        ) {
          return clock
        }
        const params = { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate() }
        return (date.getFullYear() === reference.getFullYear() ? t('clock.md', params) : t('clock.ymd', params)) + ' ' + clock
      } catch (_error) {
        return ''
      }
    }

    /** Clipboard write with a selection fallback for non-secure contexts. */
    function writeClipboard(text) {
      const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined
      if (clipboard && typeof clipboard.writeText === 'function') {
        return clipboard.writeText(text).then(
          () => true,
          () => fallbackCopy(text)
        )
      }
      return Promise.resolve(fallbackCopy(text))
    }

    function fallbackCopy(text) {
      try {
        const area = document.createElement('textarea')
        area.value = text
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        const ok = document.execCommand('copy')
        area.remove()
        return ok
      } catch (_error) {
        return false
      }
    }

    /**
     * Durable session-event entries of one retained Session, or null when the
     * binding/window is unavailable.
     * @param ctx plugin context.
     * @param sessionId Session whose conversation is rendered.
     */
    function readEventEntries(ctx, sessionId) {
      const sessions = ctx.get('sessions')
      if (sessions === undefined) return null
      const binding = sessions.binding(sessionId)
      if (!binding || !binding.eventSource) return null
      const snapshot = binding.eventSource.getSnapshot()
      return snapshot && Array.isArray(snapshot.entries) ? snapshot.entries : null
    }

    /** Sequence number of a durable entry, or undefined for transient rows. */
    function entrySeq(entry) {
      if (!entry || entry.type !== 'event' || !entry.event) return undefined
      return typeof entry.event.seq === 'number' ? entry.event.seq : undefined
    }

    /** Event type of a durable entry, or undefined. */
    function entryType(entry) {
      if (!entry || entry.type !== 'event' || !entry.event) return undefined
      return entry.event.type
    }

    /**
     * Resolve an exact inclusive source seq a fork should cut through:
     * keep every earlier turn, drop this turn and everything after it, and stay
     * balanced (no synthetic closers, no ghost turn).
     *
     * The Host appends a prompt-admission `agent/inbox/spliced` (insert) before
     * `turn/start` and claims it with a removal splice after, so the scan walks
     * back over the contiguous prompt inserts — normally the previous turn's
     * tail is the last event before them. A cut that includes the insert alone
     * would replay the old prompt as pending input in the child.
     *
     * @param ctx plugin context.
     * @param sessionId current Session id.
     * @param turnStartSeq `turn.start.seq` of the chosen turn.
     * @returns a valid inclusive seq, or null when no safe cut can be resolved.
     */
    function findForkBoundary(ctx, sessionId, turnStartSeq) {
      if (!Number.isInteger(turnStartSeq) || turnStartSeq < 1) return null
      let boundary = turnStartSeq - 1
      const entries = readEventEntries(ctx, sessionId)
      if (entries === null) return boundary
      const bySeq = new Map()
      for (const entry of entries) {
        const seq = entrySeq(entry)
        if (seq !== undefined) bySeq.set(seq, entry)
      }
      const isInsertSplice = (entry) => {
        if (entryType(entry) !== 'agent/inbox/spliced') return false
        const data = entry.event && entry.event.data ? entry.event.data : {}
        const inserted = Array.isArray(data.inserted) ? data.inserted : []
        const removed = typeof data.removedCount === 'number' ? data.removedCount : 0
        return inserted.length > 0 && removed === 0
      }
      while (boundary >= 0 && isInsertSplice(bySeq.get(boundary))) boundary -= 1
      if (boundary < 0) return null
      return boundary
    }

    /**
     * Remove interactions a forked child inherited as still-pending input.
     *
     * A prompt queued while a previous turn was running is spliced into the
     * inbox inside that turn, so even a cut before `turn/start` can inherit it
     * (the fork seed copies the insertion but not its claim). The child must be
     * empty before the edited prompt is sent, otherwise the stale prompt is
     * claimed as the child's first turn instead.
     *
     * @param ctx plugin context.
     * @param childId the freshly forked Session.
     * @returns `{ ok, removed, detail? }`.
     */
    async function clearInheritedInbox(ctx, childId) {
      let result
      try {
        result = await ctx.remote.session.projections({ sessionId: childId })
      } catch (error) {
        return { ok: false, removed: 0, detail: failureDetail(error) }
      }
      if (!result || result.ok !== true) return { ok: false, removed: 0, detail: failureDetail(result && result.error) }
      const value = result.value
      if (!value || value.kind !== 'sequenced' || !value.values) {
        // The child was just created, so this Session must have live projections.
        return { ok: false, removed: 0, detail: 'session projections unavailable' }
      }
      const pending = []
      const inbox = value.values.inbox
      for (const target of ['next-step', 'next-turn']) {
        const list = inbox && Array.isArray(inbox[target]) ? inbox[target] : []
        for (const item of list) {
          if (item && typeof item.id === 'string') pending.push(item.id)
        }
      }
      for (const itemId of pending) {
        let removal
        try {
          removal = await ctx.remote.session.updateQueue({ sessionId: childId, itemId, action: { kind: 'remove' } })
        } catch (error) {
          return { ok: false, removed: 0, detail: failureDetail(error) }
        }
        if (!removal || removal.ok !== true) return { ok: false, removed: 0, detail: failureDetail(removal && removal.error) }
      }
      return { ok: true, removed: pending.length }
    }

    /** Human-readable detail of a rejected Remote result or thrown error. */
    function failureDetail(error) {
      if (error && typeof error === 'object') {
        if (typeof error.code === 'string' && typeof error.message === 'string' && error.message !== '') return error.code + ': ' + error.message
        if (typeof error.message === 'string' && error.message !== '') return error.message
      }
      return String(error)
    }

    /* ------------------------------------------------------------------ */
    /* Icons (original inline SVG, currentColor)                           */
    /* ------------------------------------------------------------------ */

    function icon(paths, options = {}) {
      return h(
        'svg',
        {
          viewBox: options.viewBox || '0 0 16 16',
          fill: options.fill || 'none',
          stroke: options.stroke === false ? undefined : 'currentColor',
          strokeWidth: options.strokeWidth || 1.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true
        },
        ...paths.map((path, index) => h('path', { key: index, d: path }))
      )
    }

    const CopyIcon = () =>
      icon([
        'M5.4 5.4V3.6A1.6 1.6 0 0 1 7 2h5.4A1.6 1.6 0 0 1 14 3.6V9a1.6 1.6 0 0 1-1.6 1.6h-1.8',
        'M3.6 5.4h5A1.6 1.6 0 0 1 10.2 7v5.4A1.6 1.6 0 0 1 8.6 14h-5A1.6 1.6 0 0 1 2 12.4V7a1.6 1.6 0 0 1 1.6-1.6z'
      ])
    const CheckIcon = () => icon(['M2.8 8.4l3.4 3.4 6.9-7.2'], { strokeWidth: 1.6 })
    const EditIcon = () => icon(['M10.9 2.7a1.6 1.6 0 0 1 2.3 2.3L5.6 12.6l-3 .7.7-3z', 'M9.7 3.9l2.3 2.3'])
    const TrashIcon = () =>
      icon([
        'M2.8 4.2h10.4',
        'M6.2 4.2V3a1.2 1.2 0 0 1 1.2-1.2h1.2A1.2 1.2 0 0 1 9.8 3v1.2',
        'M4.4 4.2l.6 8.2a1.4 1.4 0 0 0 1.4 1.3h3.2a1.4 1.4 0 0 0 1.4-1.3l.6-8.2',
        'M6.6 6.6v4.4M9.4 6.6v4.4'
      ])
    const InfoIcon = () =>
      h(
        'svg',
        { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, 'aria-hidden': true },
        h('circle', { cx: 8, cy: 8, r: 6.1 }),
        h('path', { d: 'M8 7.3v3.5', strokeLinecap: 'round' }),
        h('circle', { cx: 8, cy: 5, r: 0.7, fill: 'currentColor', stroke: 'none' })
      )

    /* ------------------------------------------------------------------ */
    /* Small controls                                                      */
    /* ------------------------------------------------------------------ */

    /** Copy one message's text with the shipped copied/check feedback. */
    function CopyButton({ text, t }) {
      const [copied, setCopied] = React.useState(false)
      const pending = React.useRef(false)
      const timer = React.useRef(null)
      React.useEffect(
        () => () => {
          pending.current = false
          if (timer.current !== null) clearTimeout(timer.current)
        },
        []
      )
      const onClick = React.useCallback(() => {
        if (copied || pending.current) return
        pending.current = true
        writeClipboard(text).then((ok) => {
          pending.current = false
          if (!ok) return
          setCopied(true)
          timer.current = window.setTimeout(() => {
            timer.current = null
            setCopied(false)
          }, 1000)
        })
      }, [copied, text])
      const label = copied ? t('copied') : t('copy')
      return h(
        'button',
        { type: 'button', className: 'dshChatEdit_action', 'aria-label': label, title: label, onClick },
        copied ? h(CheckIcon, null) : h(CopyIcon, null)
      )
    }

    /** One icon action button for the user row. */
    function RowAction({ label, title, disabled, danger, iconComponent, onClick }) {
      return h(
        'button',
        {
          type: 'button',
          className: 'dshChatEdit_action' + (danger ? ' dshChatEdit_actionDanger' : ''),
          'aria-label': label,
          title,
          disabled: disabled === true,
          onClick
        },
        h(iconComponent, null)
      )
    }

    /**
     * Render failures of the shared content Factory stay local: the row falls
     * back to plain prompt text instead of blanking every user message.
     */
    class ContentBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { failed: false }
      }
      static getDerivedStateFromError() {
        return { failed: true }
      }
      componentDidCatch(error) {
        console.error('dsh-chat-edit: user content render failed', error)
      }
      render() {
        if (this.state.failed) return this.props.fallback ?? null
        return this.props.children
      }
    }

    /* ------------------------------------------------------------------ */
    /* Durable user row (replaces the shipped "user" Chat node renderer)   */
    /* ------------------------------------------------------------------ */

    /** Localized failure line for the current editor state. */
    function errorText(state, t) {
      if (!state.errorKind) return null
      const prefix =
        state.errorKind === 'prompt'
          ? t('error.prompt')
          : state.errorKind === 'fork'
            ? t('error.fork')
            : state.errorKind === 'inbox'
              ? t('error.inbox')
              : state.errorKind === 'empty'
                ? t('error.empty')
                : t('error.generic')
      return state.errorDetail ? prefix + ' ' + state.errorDetail : prefix
    }

    /**
     * One durable user prompt: the shipped content stack plus a Copy / Edit /
     * Delete strip (copy sits beside the two plugin actions), and — while this
     * exact row is being edited or deletion is being confirmed — an inline
     * editor card in place of the bubble, inside the conversation flow.
     *
     * @param props keyed Chat node owner props (`node`, `loadImage`), standard
     *   props (`t`, `sessionId`, `useAccess`, `useChat`), and injected verbs.
     */
    function UserNodeView(props) {
      const {
        node,
        loadImage,
        renderFactorySlot,
        t,
        sessionId,
        useAccess,
        useChat,
        useChatEditState,
        openEdit,
        openDelete,
        submitEdit,
        submitDelete,
        closeEditor,
        updateDraft
      } = props
      // Editing resends in this same conversation (no fork/archive); deleting
      // still replaces the conversation through fork + archive.
      const canEdit = useAccess('session/prompt')
      const canDelete = useAccess('session/fork')
      const nodeId = node !== undefined && node !== null ? (typeof node.id === 'string' ? node.id : node.key) : undefined
      const current = useChatEditState((state) =>
        state.kind !== null && state.sessionId === sessionId && state.nodeId === nodeId ? state : null
      )
      // One operation at a time: every row's edit/delete locks while any
      // editor is submitting, so a second click cannot race the fork/archive.
      const anyBusy = useChatEditState((state) => state.kind !== null && state.busy === true)
      const lastTurn = useChat((snapshot) => {
        const order = snapshot.timeline.turnOrder
        return order.length > 0 ? order[order.length - 1] : undefined
      })
      const data = node !== undefined && node !== null ? node.data : undefined
      const prepared = React.useMemo(() => prepareUserContent(data), [data])
      const text = prepared.content.text
      const attachments = hasNonText(data && data.content)
      const editing = current !== null && current.kind === 'edit'
      const confirming = current !== null && current.kind === 'delete'
      const draft = editing ? current.text : ''
      const busy = anyBusy
      const error = current !== null ? errorText(current, t) : null
      const textareaRef = React.useRef(null)
      // Re-render the clock after local midnight, like the shipped icon rows.
      const [day, setDay] = React.useState(() => startOfLocalDay(Date.now()))
      React.useEffect(() => {
        let timer
        const arm = () => {
          const now = Date.now()
          setDay(startOfLocalDay(now))
          timer = window.setTimeout(arm, msUntilNextLocalMidnight(now))
        }
        timer = window.setTimeout(arm, msUntilNextLocalMidnight(Date.now()))
        return () => window.clearTimeout(timer)
      }, [])

      React.useLayoutEffect(() => {
        if (!editing) return
        const area = textareaRef.current
        if (area === null) return
        area.style.height = 'auto'
        const max = Math.max(240, Math.round(window.innerHeight * 0.42))
        area.style.height = Math.min(Math.max(area.scrollHeight, 72), max) + 'px'
      }, [editing, draft])

      // Escape closes the inline editor or the delete confirmation, whichever
      // is open; the textarea alone cannot receive it while focus is elsewhere.
      React.useEffect(() => {
        if (!editing && !confirming) return undefined
        const onKeyDown = (event) => {
          if (event.key !== 'Escape' || busy) return
          event.preventDefault()
          event.stopPropagation()
          closeEditor()
        }
        document.addEventListener('keydown', onKeyDown, true)
        return () => document.removeEventListener('keydown', onKeyDown, true)
      }, [editing, confirming, busy, closeEditor])

      const turn =
        node !== undefined && node !== null && node.location !== undefined && (node.location.kind === 'turn' || node.location.kind === 'step')
          ? node.location.turn
          : undefined
      const turnNumber = turn !== undefined && typeof turn.turn === 'number' ? turn.turn : undefined
      const hasLater = turnNumber !== undefined && lastTurn !== undefined && lastTurn > turnNumber
      const clock = data !== undefined ? formatClock(data.time, t, day) : ''

      const startEdit = () => {
        if (!canEdit) return
        openEdit({ nodeId, text, hasAttachments: attachments, hasLater })
      }
      const startDelete = () => {
        if (!canDelete || turn === undefined) return
        openDelete({ nodeId, turn, hasLater })
      }

      const send = () => {
        if (busy || current === null || current.kind !== 'edit') return
        if (current.text.trim() === '') return
        submitEdit({ sessionId: current.sessionId, text: current.text })
      }

      const confirmDelete = () => {
        if (busy || current === null || current.kind !== 'delete') return
        submitDelete({ sessionId: current.sessionId, boundary: current.boundary })
      }

      const onEditorKeyDown = (event) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault()
          send()
        }
      }

      if (editing) {
        return h(
          'div',
          { className: 'dshChatEdit_userRow' },
          h(
            'div',
            { className: 'dshChatEdit_editorCard' },
            h('textarea', {
              ref: textareaRef,
              className: 'dshChatEdit_textarea',
              value: current.text,
              placeholder: t('edit.placeholder'),
              'aria-label': t('edit.aria'),
              spellCheck: false,
              autoFocus: true,
              disabled: busy,
              onChange: (event) => {
                updateDraft(event.target.value)
              },
              onKeyDown: onEditorKeyDown
            }),
            h('div', { className: 'dshChatEdit_hintRow' }, h(InfoIcon, null), h('span', null, t('edit.hint'))),
            attachments ? h('div', { className: 'dshChatEdit_hintRow' }, h('span', null, t('edit.attachments'))) : null,
            error !== null ? h('div', { className: 'dshChatEdit_error', role: 'alert' }, error) : null,
            h(
              'div',
              { className: 'dshChatEdit_editorFooter' },
              h('button', { type: 'button', className: 'dshChatEdit_btn', disabled: busy, onClick: closeEditor }, t('cancel')),
              h(
                'button',
                { type: 'button', className: 'dshChatEdit_btn dshChatEdit_btnPrimary', disabled: busy || current.text.trim() === '', onClick: send },
                busy ? t('busy') : t('send')
              )
            )
          )
        )
      }

      if (confirming) {
        return h(
          'div',
          { className: 'dshChatEdit_userRow' },
          h(
            'div',
            { className: 'dshChatEdit_editorCard' },
            h('div', { className: 'dshChatEdit_confirmTitle' }, t('delete.title')),
            h('div', { className: 'dshChatEdit_hintRow' }, h(InfoIcon, null), h('span', null, hasLater ? t('delete.bodyLater') : t('delete.bodyLast'))),
            h('div', { className: 'dshChatEdit_hintRow' }, h('span', null, t('delete.keep'))),
            error !== null ? h('div', { className: 'dshChatEdit_error', role: 'alert' }, error) : null,
            h(
              'div',
              { className: 'dshChatEdit_editorFooter' },
              h('button', { type: 'button', className: 'dshChatEdit_btn', disabled: busy, onClick: closeEditor, autoFocus: true }, t('cancel')),
              h('button', { type: 'button', className: 'dshChatEdit_btn dshChatEdit_btnDanger', disabled: busy, onClick: confirmDelete }, busy ? t('busy') : t('delete.confirm'))
            )
          )
        )
      }

      return h(
        'div',
        { className: 'dshChatEdit_userRow' },
        h(
          ContentBoundary,
          { fallback: h('div', { className: 'dshChatEdit_fallbackBubble' }, text) },
          renderFactorySlot('conversation.chat.user.content', {
            content: prepared.content,
            loadImage,
            facts: prepared.facts,
            interactive: true
          })
        ),
        h(
          'div',
          { className: 'dshChatEdit_actions' },
          clock === '' ? null : h('span', { className: 'dshChatEdit_time' }, clock),
          h(CopyButton, { text, t }),
          canEdit
            ? h(RowAction, {
                label: t('action.edit'),
                title: text === '' ? t('unavailable') : t('action.editTitle'),
                disabled: busy || text === '',
                iconComponent: EditIcon,
                onClick: startEdit
              })
            : null,
          canDelete
            ? h(RowAction, {
                label: t('action.delete'),
                title: t('action.deleteTitle'),
                disabled: busy,
                danger: true,
                iconComponent: TrashIcon,
                onClick: startDelete
              })
            : null
        )
      )
    }

    /* ------------------------------------------------------------------ */
    /* Toast (shell.overlay)                                              */
    /* ------------------------------------------------------------------ */

    /** One short non-blocking notice for failures that happen after navigation. */
    function ToastHost(props) {
      const { t, useChatEditToast, clearToast } = props
      const toast = useChatEditToast((value) => value)
      React.useEffect(() => {
        if (toast.code === null) return undefined
        const timer = window.setTimeout(() => clearToast(), 6000)
        return () => window.clearTimeout(timer)
      }, [toast.seq, clearToast])
      if (toast.code === null) return null
      return h('div', { className: 'dshChatEdit_toast', role: 'status' }, t('toast.' + toast.code))
    }

    /* ------------------------------------------------------------------ */
    /* Plugin body                                                         */
    /* ------------------------------------------------------------------ */

    /**
     * Client half of the bundle: a durable user-row renderer with Copy / Edit /
     * Delete and an inline editor. Fork / prompt / queue cleanup run through
     * existing services; no Host-side behavior and no private Host state.
     *
     * @param ctx Client root context.
     */
    function apply(ctx) {
      const editor = createStore({ kind: null })
      /**
       * Child created by the current DELETE attempt. A post-fork failure keeps
       * this so a retry finishes the remaining steps on the same branch instead
       * of forking a second one. Cleared whenever the editor opens or closes.
       */
      let pendingBranch = null
      /** Non-blocking notice for failures that happen after navigation. */
      const toast = createStore({ code: null, seq: 0 })
      let noticeSeq = 0

      ctx.effect(() => {
        const tag = document.createElement('style')
        tag.textContent = CSS
        tag.setAttribute('data-plugin', 'dsh-chat-edit')
        document.head.appendChild(tag)
        return () => {
          tag.remove()
        }
      }, 'chat-edit: styles')

      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'chat-edit: dictionaries')

      const showToast = (code) => {
        noticeSeq += 1
        toast.set({ code, seq: noticeSeq })
      }
      const clearToast = () => toast.set({ code: null, seq: noticeSeq })

      /** Hide a half-finished replacement so the sidebar stays single-entry. */
      const discardPendingBranch = () => {
        if (pendingBranch === null) return
        const childId = pendingBranch.childId
        pendingBranch = null
        void Promise.resolve(ctx.uiWorkspace.archiveSession(childId, { stopActivity: true })).catch(() => {})
      }

      /** Close the inline editor / confirmation and hide any half-finished replacement. */
      const closeEditor = () => {
        discardPendingBranch()
        editor.set({ kind: null })
      }

      /** Update the open editor's draft text and clear its stale error. */
      const updateDraft = (text) => {
        const state = editor.getSnapshot()
        if (state.kind !== 'edit' || state.text === text) return
        editor.set({ ...state, text, errorKind: null, errorDetail: null })
      }

      /** Patch the active editor attempt (no-op when no dialog is open). */
      const patchEditor = (fields) => {
        const state = editor.getSnapshot()
        if (state.kind !== 'edit' && state.kind !== 'delete') return
        editor.set({ ...state, ...fields })
      }

      /**
       * Resolve the replacement conversation for one attempt: reuse the child
       * created by a failed earlier attempt at the same cut, else fork one.
       * The original conversation is archived after success, so the sidebar
       * keeps showing exactly one conversation.
       * @param payload - `{ sessionId, boundary }` of the open editor.
       * @returns the child Session id (throws on fork failure).
       */
      const resolveChild = async (payload) => {
        if (pendingBranch !== null && pendingBranch.sessionId === payload.sessionId && pendingBranch.boundary === payload.boundary) {
          return pendingBranch.childId
        }
        const childId = await ctx.sessions.fork({
          sessionId: payload.sessionId,
          atSeq: payload.boundary,
          increaseTitle: false
        })
        pendingBranch = { sessionId: payload.sessionId, boundary: payload.boundary, childId }
        return childId
      }

      /** Keep the replacement conversation's title identical to the original. */
      const keepTitle = async (childId, parentId) => {
        let title
        try {
          const sessions = ctx.get('sessions')
          const binding = sessions && sessions.binding ? sessions.binding(parentId) : undefined
          const projected =
            binding && binding.session && binding.session.projections
              ? binding.session.projections.faceOf('title').getSnapshot()
              : undefined
          if (typeof projected === 'string' && projected !== '') title = projected
          if (title === undefined) {
            const row = sessions && sessions.list ? sessions.list.getSnapshot().byId[parentId] : undefined
            if (row && typeof row.title === 'string' && row.title !== '') title = row.title
          }
        } catch (_error) {
          /* title is best-effort; the fork seed may already carry it */
        }
        if (title === undefined) return
        try {
          await ctx.remote.session.rename({ sessionId: childId, title })
        } catch (_error) {
          /* ignore: the conversation still works without the exact title */
        }
      }

      /**
       * Show the replacement conversation and archive the original, so the
       * user keeps a single sidebar entry after an in-place edit or delete.
       * State is cleared only after the replacement was actually opened: an
       * openSession failure keeps the editor and the half-finished child so a
       * retry can finish without forking again.
       */
      const finishReplace = async (parentId, childId) => {
        await keepTitle(childId, parentId)
        ctx.uiWorkspace.openSession(childId)
        try {
          await ctx.uiWorkspace.archiveSession(parentId, { stopActivity: true })
        } catch (_error) {
          showToast('archiveFailed')
        }
        pendingBranch = null
        editor.set({ kind: null })
      }

      /** Edit: send the edited prompt as the next turn of the SAME conversation. */
      const submitEdit = async (payload) => {
        const state = editor.getSnapshot()
        if (state.kind === 'edit' && state.busy === true) return { ok: false, kind: 'busy', detail: 'operation in progress' }
        if (payload.text.trim() === '') {
          patchEditor({ busy: false, errorKind: 'empty', errorDetail: null })
          return { ok: false, kind: 'empty', detail: '' }
        }
        patchEditor({ busy: true, errorKind: null, errorDetail: null })
        let result
        try {
          const zone = clientTimeZone()
          result = await ctx.remote.session.prompt({
            requestId: newRequestId(),
            sessionId: payload.sessionId,
            mode: 'queue',
            content: [{ type: 'text', text: payload.text }],
            ...(zone === undefined ? {} : { clientTimeZone: zone })
          })
        } catch (error) {
          const detail = failureDetail(error)
          patchEditor({ busy: false, errorKind: 'prompt', errorDetail: detail })
          return { ok: false, kind: 'prompt', detail }
        }
        if (!result || result.ok !== true) {
          const detail = failureDetail(result && result.error)
          patchEditor({ busy: false, errorKind: 'prompt', errorDetail: detail })
          return { ok: false, kind: 'prompt', detail }
        }
        // Zero-branch edit: the edited prompt is a normal next turn of this
        // conversation, so there is nothing to fork, open, or archive.
        editor.set({ kind: null })
        return { ok: true }
      }

      /** Delete: fork before the turn, drop inherited pending input, then open the child. */
      const submitDelete = async (payload) => {
        const state = editor.getSnapshot()
        if (state.kind === 'delete' && state.busy === true) return { ok: false, kind: 'busy', detail: 'operation in progress' }
        patchEditor({ busy: true, errorKind: null, errorDetail: null })
        let childId
        try {
          childId = await resolveChild(payload)
        } catch (error) {
          const detail = failureDetail(error)
          patchEditor({ busy: false, errorKind: 'fork', errorDetail: detail })
          return { ok: false, kind: 'fork', detail }
        }
        const cleaned = await clearInheritedInbox(ctx, childId)
        if (!cleaned.ok) {
          patchEditor({ busy: false, errorKind: 'inbox', errorDetail: cleaned.detail })
          return { ok: false, kind: 'inbox', detail: cleaned.detail }
        }
        try {
          await finishReplace(payload.sessionId, childId)
        } catch (error) {
          const detail = failureDetail(error)
          patchEditor({ busy: false, errorKind: 'generic', errorDetail: detail })
          return { ok: false, kind: 'generic', detail }
        }
        return { ok: true }
      }

      const openFor = (sessionId, kind) => (input) => {
        discardPendingBranch()
        if (kind === 'edit') {
          // Editing needs no boundary: it resends inside this conversation.
          editor.set({
            kind: 'edit',
            sessionId,
            nodeId: input.nodeId,
            text: input.text,
            hasAttachments: input.hasAttachments === true,
            hasLater: input.hasLater === true,
            busy: false,
            errorKind: null,
            errorDetail: null
          })
          return
        }
        const turn = input.turn
        const startSeq = turn && turn.start && typeof turn.start.seq === 'number' ? turn.start.seq : undefined
        const boundary = findForkBoundary(ctx, sessionId, startSeq)
        if (boundary === null) {
          showToast('boundaryUnavailable')
          return
        }
        editor.set({
          kind: 'delete',
          sessionId,
          nodeId: input.nodeId,
          boundary,
          text: '',
          hasAttachments: false,
          hasLater: input.hasLater === true,
          busy: false,
          errorKind: null,
          errorDetail: null
        })
      }

      ctx.slots.inject('conversation.chat.node', () =>
        ctx.slots.register(
          {
            name: 'conversation.chat.node',
            key: 'user',
            priority: -1,
            locale: NS,
            inject: (sessionId) => ({
              hooks: { chatEditState: editor },
              openEdit: openFor(sessionId, 'edit'),
              openDelete: openFor(sessionId, 'delete'),
              submitEdit,
              submitDelete,
              closeEditor,
              updateDraft
            })
          },
          UserNodeView
        )
      )

      ctx.slots.inject('shell.overlay', () =>
        ctx.slots.register(
          {
            name: 'shell.overlay',
            id: 'chat-edit-toast',
            order: 100,
            locale: NS,
            inject: () => ({
              hooks: { chatEditToast: toast },
              clearToast
            })
          },
          ToastHost
        )
      )
    }

    return { inject, apply }
  }
})
