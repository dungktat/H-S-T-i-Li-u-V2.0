import { 
  BrandConfig, 
  UserProfile, 
  ExistingDocument, 
  DraftDossier, 
  IncomingDocument, 
  OutgoingDocument, 
  SystemNotification,
  DepartmentItem,
  UnitItem,
  IssuingAgencyItem,
  DocTypeMetadataSchema,
  AssignedTask,
  DocumentVersion
} from '../types';
import { 
  DEFAULT_BRAND_CONFIG, 
  SAMPLE_USERS, 
  INITIAL_EXISTING_DOCS, 
  INITIAL_DRAFTS, 
  INITIAL_INCOMING_DOCS, 
  INITIAL_OUTGOING_DOCS, 
  INITIAL_NOTIFICATIONS,
  DEFAULT_DEPARTMENTS,
  DEFAULT_UNITS,
  DEFAULT_ISSUING_AGENCIES,
  DEFAULT_METADATA_SCHEMAS,
  INITIAL_ASSIGNED_TASKS
} from '../data/initialData';

const KEYS = {
  BRAND: 'hstl_win12_brand_config',
  CURRENT_USER: 'hstl_win12_current_user',
  EXISTING_DOCS: 'hstl_win12_existing_docs',
  DRAFTS: 'hstl_win12_drafts',
  INCOMING: 'hstl_win12_incoming_docs',
  OUTGOING: 'hstl_win12_outgoing_docs',
  NOTIFICATIONS: 'hstl_win12_notifications',
  DEPARTMENTS: 'hstl_win12_departments',
  UNITS: 'hstl_win12_units',
  ISSUING_AGENCIES: 'hstl_win12_issuing_agencies',
  USERS: 'hstl_win12_users',
  METADATA_SCHEMAS: 'hstl_win12_metadata_schemas',
  TASKS: 'hstl_win12_assigned_tasks'
};

export class StorageService {
  // Brand Config
  static getBrandConfig(): BrandConfig {
    try {
      const data = localStorage.getItem(KEYS.BRAND);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_BRAND_CONFIG;
  }

  static saveBrandConfig(config: BrandConfig): void {
    localStorage.setItem(KEYS.BRAND, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'brand' } }));
  }

  // Current User
  static getCurrentUser(): UserProfile {
    try {
      const data = localStorage.getItem(KEYS.CURRENT_USER);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_USERS[0]; // Chuyên viên by default
  }

  static setCurrentUser(user: UserProfile): void {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'user' } }));
  }

  // Luồng 1: Existing Docs
  static getExistingDocs(): ExistingDocument[] {
    try {
      const data = localStorage.getItem(KEYS.EXISTING_DOCS);
      if (data) {
        let docs: ExistingDocument[] = JSON.parse(data);
        if (Array.isArray(docs)) {
          let hasDuplicate = false;
          const seenIds = new Set<string>();
          docs = docs.map((d, idx) => {
            // Auto-heal legacy duplicate id hstl-ex-008
            if (d.soKyHieu === '09/KH-MẬT/2026' && d.id === 'hstl-ex-008') {
              hasDuplicate = true;
              return { ...d, id: 'hstl-ex-009' };
            }
            if (seenIds.has(d.id)) {
              hasDuplicate = true;
              return { ...d, id: `${d.id}-${idx}` };
            }
            seenIds.add(d.id);
            return d;
          });
          if (hasDuplicate) {
            localStorage.setItem(KEYS.EXISTING_DOCS, JSON.stringify(docs));
          }
          return docs;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EXISTING_DOCS;
  }

  static saveExistingDocs(docs: ExistingDocument[]): void {
    localStorage.setItem(KEYS.EXISTING_DOCS, JSON.stringify(docs));
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'existing_docs' } }));
  }

  static addExistingDoc(doc: ExistingDocument): void {
    const docs = this.getExistingDocs();
    docs.unshift(doc);
    this.saveExistingDocs(docs);
    this.addNotification({
      id: 'notif-' + Date.now(),
      title: 'Hồ sơ đã cập nhật vào Luồng 1',
      message: `Văn bản ${doc.soKyHieu} đã được trình Trưởng phòng thẩm tra.`,
      timestamp: 'Vừa xong',
      type: 'info',
      relatedFlow: 'LUONG_1',
      relatedDocId: doc.id,
      isRead: false
    });
  }

  static updateExistingDoc(id: string, updates: Partial<ExistingDocument>): void {
    const docs = this.getExistingDocs();
    const idx = docs.findIndex((d) => d.id === id);
    if (idx !== -1) {
      docs[idx] = { ...docs[idx], ...updates };
      this.saveExistingDocs(docs);
    }
  }

  // Luồng 2: Drafts
  static getDrafts(): DraftDossier[] {
    try {
      const data = localStorage.getItem(KEYS.DRAFTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DRAFTS;
  }

  static saveDrafts(drafts: DraftDossier[]): void {
    localStorage.setItem(KEYS.DRAFTS, JSON.stringify(drafts));
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'drafts' } }));
  }

  static addDraft(draft: DraftDossier): void {
    const drafts = this.getDrafts();
    drafts.unshift(draft);
    this.saveDrafts(drafts);
    this.addNotification({
      id: 'notif-' + Date.now(),
      title: 'Dự thảo mới đã tạo',
      message: `Dự thảo ${draft.code} đã được trình Trưởng phòng kiểm tra.`,
      timestamp: 'Vừa xong',
      type: 'info',
      relatedFlow: 'LUONG_2',
      relatedDocId: draft.id,
      isRead: false
    });
  }

  static updateDraft(id: string, updates: Partial<DraftDossier>): void {
    const drafts = this.getDrafts();
    const idx = drafts.findIndex((d) => d.id === id);
    if (idx !== -1) {
      drafts[idx] = { ...drafts[idx], ...updates };
      this.saveDrafts(drafts);
    }
  }

  // Giao Việc & Điều Hành Nhiệm Vụ (Lãnh đạo -> Nhân viên)
  static getTasks(): AssignedTask[] {
    try {
      const data = localStorage.getItem(KEYS.TASKS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ASSIGNED_TASKS;
  }

  static saveTasks(tasks: AssignedTask[]): void {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'tasks' } }));
  }

  static addTask(task: AssignedTask): void {
    const tasks = this.getTasks();
    tasks.unshift(task);
    this.saveTasks(tasks);
    this.addNotification({
      id: 'notif-' + Date.now(),
      title: 'Nhiệm vụ giao việc mới',
      message: `${task.assignedByName} đã giao nhiệm vụ "${task.title}" cho ${task.primaryAssigneeName}.`,
      timestamp: 'Vừa xong',
      type: 'info',
      relatedFlow: 'LUONG_2',
      relatedDocId: task.id,
      isRead: false
    });
  }

  static updateTask(id: string, updates: Partial<AssignedTask>): void {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...updates };
      this.saveTasks(tasks);
    }
  }

  static deleteTask(id: string): void {
    const tasks = this.getTasks().filter((t) => t.id !== id);
    this.saveTasks(tasks);
  }

  // Luồng 3: Incoming Docs
  static getIncomingDocs(): IncomingDocument[] {
    try {
      const data = localStorage.getItem(KEYS.INCOMING);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_INCOMING_DOCS;
  }

  static saveIncomingDocs(docs: IncomingDocument[]): void {
    localStorage.setItem(KEYS.INCOMING, JSON.stringify(docs));
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'incoming_docs' } }));
  }

  static addIncomingDoc(doc: IncomingDocument): void {
    const docs = this.getIncomingDocs();
    docs.unshift(doc);
    this.saveIncomingDocs(docs);
    this.addNotification({
      id: 'notif-' + Date.now(),
      title: 'Văn bản đến mới đã vào Sổ',
      message: `Đã tiếp nhận Số đến ${doc.soDen} (${doc.soKyHieuGoc}) và tự động lập chỉ mục Thư viện HSTL.`,
      timestamp: 'Vừa xong',
      type: 'success',
      relatedFlow: 'LUONG_3',
      relatedDocId: doc.id,
      isRead: false
    });
  }

  static updateIncomingDoc(id: string, updates: Partial<IncomingDocument>): void {
    const docs = this.getIncomingDocs();
    const idx = docs.findIndex((d) => d.id === id);
    if (idx !== -1) {
      docs[idx] = { ...docs[idx], ...updates };
      this.saveIncomingDocs(docs);
    }
  }

  // Luồng 4: Outgoing Docs
  static getOutgoingDocs(): OutgoingDocument[] {
    try {
      const data = localStorage.getItem(KEYS.OUTGOING);
      if (data) {
        const parsed: OutgoingDocument[] = JSON.parse(data);
        // Ensure default docs have recipient permissions updated if missing
        let hasChanges = false;
        parsed.forEach(doc => {
          if (!doc.noiNhanDepartments && !doc.noiNhanUserIds) {
            const initialMatch = INITIAL_OUTGOING_DOCS.find(init => init.id === doc.id);
            if (initialMatch) {
              doc.noiNhan = initialMatch.noiNhan;
              doc.noiNhanDepartments = initialMatch.noiNhanDepartments;
              doc.noiNhanUserIds = initialMatch.noiNhanUserIds;
              doc.noiNhanUserNames = initialMatch.noiNhanUserNames;
              doc.noiNhanExternal = initialMatch.noiNhanExternal;
              hasChanges = true;
            }
          }
        });
        // Check if out-003 exists
        if (!parsed.some(d => d.id === 'out-003')) {
          const out003 = INITIAL_OUTGOING_DOCS.find(d => d.id === 'out-003');
          if (out003) {
            parsed.push(out003);
            hasChanges = true;
          }
        }
        if (hasChanges) {
          localStorage.setItem(KEYS.OUTGOING, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_OUTGOING_DOCS;
  }

  static saveOutgoingDocs(docs: OutgoingDocument[]): void {
    localStorage.setItem(KEYS.OUTGOING, JSON.stringify(docs));
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'outgoing_docs' } }));
  }

  static addOutgoingDoc(doc: OutgoingDocument): void {
    const docs = this.getOutgoingDocs();
    docs.unshift(doc);
    this.saveOutgoingDocs(docs);
    this.addNotification({
      id: 'notif-' + Date.now(),
      title: 'Cập nhật VB Đi & Lưu Thư viện HSTL',
      message: `Đã cập nhật văn bản đi số ${doc.soDiFullCode} và chuyển lưu trữ vào Thư viện HSTL.`,
      timestamp: 'Vừa xong',
      type: 'success',
      relatedFlow: 'LUONG_4',
      relatedDocId: doc.id,
      isRead: false
    });
  }

  static updateOutgoingDoc(id: string, updates: Partial<OutgoingDocument>): void {
    const docs = this.getOutgoingDocs();
    const idx = docs.findIndex((d) => d.id === id);
    if (idx !== -1) {
      docs[idx] = { ...docs[idx], ...updates };
      this.saveOutgoingDocs(docs);
    }
  }

  // Universal deletion & update for all document types (Admin Metadata Management)
  static deleteExistingDoc(id: string): void {
    const docs = this.getExistingDocs().filter((d) => d.id !== id);
    this.saveExistingDocs(docs);
  }

  static deleteDraft(id: string): void {
    const drafts = this.getDrafts().filter((d) => d.id !== id);
    this.saveDrafts(drafts);
  }

  static deleteIncomingDoc(id: string): void {
    const docs = this.getIncomingDocs().filter((d) => d.id !== id);
    this.saveIncomingDocs(docs);
  }

  static deleteOutgoingDoc(id: string): void {
    const docs = this.getOutgoingDocs().filter((d) => d.id !== id);
    this.saveOutgoingDocs(docs);
  }

  static deleteDocument(id: string, flowType?: string): void {
    if (flowType === 'LUONG_1' || flowType === 'HSTL') {
      const docs = this.getExistingDocs();
      if (docs.some((d) => d.id === id)) {
        this.deleteExistingDoc(id);
        return;
      }
    }
    if (flowType === 'LUONG_2') {
      const drafts = this.getDrafts();
      if (drafts.some((d) => d.id === id)) {
        this.deleteDraft(id);
        return;
      }
    }
    if (flowType === 'LUONG_3') {
      const docs = this.getIncomingDocs();
      if (docs.some((d) => d.id === id)) {
        this.deleteIncomingDoc(id);
        return;
      }
    }
    if (flowType === 'LUONG_4') {
      const docs = this.getOutgoingDocs();
      if (docs.some((d) => d.id === id)) {
        this.deleteOutgoingDoc(id);
        return;
      }
    }

    // Fallback: check all collections
    this.deleteExistingDoc(id);
    this.deleteDraft(id);
    this.deleteIncomingDoc(id);
    this.deleteOutgoingDoc(id);
  }

  static updateUniversalDoc(id: string, updates: Record<string, any>, flowType?: string): void {
    // 1. Existing docs
    const existing = this.getExistingDocs();
    const exIdx = existing.findIndex((d) => d.id === id);
    if (exIdx !== -1) {
      existing[exIdx] = {
        ...existing[exIdx],
        ...updates,
        customMetadata: updates.customMetadata !== undefined ? updates.customMetadata : existing[exIdx].customMetadata
      };
      this.saveExistingDocs(existing);
      return;
    }

    // 2. Drafts
    const drafts = this.getDrafts();
    const drIdx = drafts.findIndex((d) => d.id === id);
    if (drIdx !== -1) {
      drafts[drIdx] = {
        ...drafts[drIdx],
        ...updates,
        customMetadata: updates.customMetadata !== undefined ? updates.customMetadata : (drafts[drIdx] as any).customMetadata
      };
      this.saveDrafts(drafts);
      return;
    }

    // 3. Incoming
    const incoming = this.getIncomingDocs();
    const inIdx = incoming.findIndex((d) => d.id === id);
    if (inIdx !== -1) {
      incoming[inIdx] = {
        ...incoming[inIdx],
        ...updates,
        customMetadata: updates.customMetadata !== undefined ? updates.customMetadata : (incoming[inIdx] as any).customMetadata
      };
      this.saveIncomingDocs(incoming);
      return;
    }

    // 4. Outgoing
    const outgoing = this.getOutgoingDocs();
    const outIdx = outgoing.findIndex((d) => d.id === id);
    if (outIdx !== -1) {
      outgoing[outIdx] = {
        ...outgoing[outIdx],
        ...updates,
        customMetadata: updates.customMetadata !== undefined ? updates.customMetadata : (outgoing[outIdx] as any).customMetadata
      };
      this.saveOutgoingDocs(outgoing);
      return;
    }
  }

  // ==========================================
  // QUẢN LÝ PHIÊN BẢN TÀI LIỆU (VERSIONS)
  // ==========================================
  static addDocumentVersion(
    docId: string, 
    versionData: Omit<DocumentVersion, 'id'>, 
    flowType?: string
  ): DocumentVersion {
    const newVersionId = 'ver-' + Date.now();
    const newVersion: DocumentVersion = {
      ...versionData,
      id: newVersionId,
      isCurrent: true
    };

    // Find the doc
    let targetDoc: any = null;
    const existing = this.getExistingDocs();
    const exIdx = existing.findIndex(d => d.id === docId);
    if (exIdx !== -1) targetDoc = existing[exIdx];

    if (!targetDoc) {
      const drafts = this.getDrafts();
      const drIdx = drafts.findIndex(d => d.id === docId);
      if (drIdx !== -1) targetDoc = drafts[drIdx];
    }

    if (!targetDoc) {
      const incoming = this.getIncomingDocs();
      const inIdx = incoming.findIndex(d => d.id === docId);
      if (inIdx !== -1) targetDoc = incoming[inIdx];
    }

    if (!targetDoc) {
      const outgoing = this.getOutgoingDocs();
      const outIdx = outgoing.findIndex(d => d.id === docId);
      if (outIdx !== -1) targetDoc = outgoing[outIdx];
    }

    const currentVersions: DocumentVersion[] = Array.isArray(targetDoc?.versions) && targetDoc.versions.length > 0
      ? targetDoc.versions.map((v: DocumentVersion) => ({ ...v, isCurrent: false }))
      : [
          {
            id: 'ver-initial-' + docId,
            version: 1,
            versionLabel: 'v1.0 - Bản gốc ban đầu',
            fileName: targetDoc?.fileName || targetDoc?.draftFileName || 'TaiLieu_BanGoc.pdf',
            fileSize: targetDoc?.fileSize || targetDoc?.draftFileSize || '2.5 MB',
            fileUrl: targetDoc?.fileScanUrl || targetDoc?.draftFileUrl || 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
            uploadedAt: targetDoc?.createdAt || new Date().toISOString(),
            uploadedById: targetDoc?.createdBy || targetDoc?.creatorId || 'system',
            uploadedByName: targetDoc?.createdByName || targetDoc?.creatorName || 'Người tạo ban đầu',
            changeNote: 'Khởi tạo hồ sơ ban đầu',
            isCurrent: false
          }
        ];

    const updatedVersions = [newVersion, ...currentVersions];
    const updates: Record<string, any> = {
      currentVersion: newVersion.version,
      versions: updatedVersions,
      fileName: newVersion.fileName,
      fileSize: newVersion.fileSize,
      fileScanUrl: newVersion.fileUrl
    };

    if (targetDoc?.draftFileName !== undefined) {
      updates.draftFileName = newVersion.fileName;
      updates.draftFileSize = newVersion.fileSize;
      updates.draftFileUrl = newVersion.fileUrl;
    }

    this.updateUniversalDoc(docId, updates, flowType);

    this.addNotification({
      id: 'notif-' + Date.now(),
      title: 'Phiên bản tài liệu mới',
      message: `Đã cập nhật phiên bản ${newVersion.versionLabel} cho hồ sơ/tài liệu.`,
      timestamp: 'Vừa xong',
      type: 'info',
      relatedDocId: docId,
      isRead: false
    });

    return newVersion;
  }

  static setActiveDocumentVersion(
    docId: string, 
    versionNumber: number, 
    flowType?: string
  ): void {
    let targetDoc: any = null;
    const existing = this.getExistingDocs();
    const exIdx = existing.findIndex(d => d.id === docId);
    if (exIdx !== -1) targetDoc = existing[exIdx];

    if (!targetDoc) {
      const drafts = this.getDrafts();
      const drIdx = drafts.findIndex(d => d.id === docId);
      if (drIdx !== -1) targetDoc = drafts[drIdx];
    }

    if (!targetDoc) {
      const incoming = this.getIncomingDocs();
      const inIdx = incoming.findIndex(d => d.id === docId);
      if (inIdx !== -1) targetDoc = incoming[inIdx];
    }

    if (!targetDoc) {
      const outgoing = this.getOutgoingDocs();
      const outIdx = outgoing.findIndex(d => d.id === docId);
      if (outIdx !== -1) targetDoc = outgoing[outIdx];
    }

    if (!targetDoc || !targetDoc.versions) return;

    const chosenVersion = targetDoc.versions.find((v: DocumentVersion) => v.version === versionNumber);
    if (!chosenVersion) return;

    const updatedVersions = targetDoc.versions.map((v: DocumentVersion) => ({
      ...v,
      isCurrent: v.version === versionNumber
    }));

    const updates: Record<string, any> = {
      currentVersion: versionNumber,
      versions: updatedVersions,
      fileName: chosenVersion.fileName,
      fileSize: chosenVersion.fileSize,
      fileScanUrl: chosenVersion.fileUrl
    };

    if (targetDoc.draftFileName !== undefined) {
      updates.draftFileName = chosenVersion.fileName;
      updates.draftFileSize = chosenVersion.fileSize;
      updates.draftFileUrl = chosenVersion.fileUrl;
    }

    this.updateUniversalDoc(docId, updates, flowType);

    this.addNotification({
      id: 'notif-' + Date.now(),
      title: 'Chuyển phiên bản tài liệu',
      message: `Đã kích hoạt phiên bản v${versionNumber} làm phiên bản hiện hành.`,
      timestamp: 'Vừa xong',
      type: 'info',
      relatedDocId: docId,
      isRead: false
    });
  }

  // Notifications
  static getNotifications(): SystemNotification[] {
    try {
      const data = localStorage.getItem(KEYS.NOTIFICATIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_NOTIFICATIONS;
  }

  static addNotification(notif: SystemNotification): void {
    const list = this.getNotifications();
    list.unshift(notif);
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'notifications' } }));
  }

  static markAllNotificationsRead(): void {
    const list = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'notifications' } }));
  }

  // ==========================================
  // MASTER DATA: PHÒNG BAN (DEPARTMENTS)
  // ==========================================
  static getDepartments(): DepartmentItem[] {
    try {
      const data = localStorage.getItem(KEYS.DEPARTMENTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_DEPARTMENTS;
  }

  static saveDepartments(departments: DepartmentItem[]): void {
    localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(departments));
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'departments' } }));
  }

  static addDepartment(dept: DepartmentItem): void {
    const list = this.getDepartments();
    list.unshift(dept);
    this.saveDepartments(list);
  }

  static updateDepartment(id: string, updates: Partial<DepartmentItem>): void {
    const list = this.getDepartments();
    const idx = list.findIndex(d => d.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.saveDepartments(list);
    }
  }

  static deleteDepartment(id: string): void {
    const list = this.getDepartments().filter(d => d.id !== id);
    this.saveDepartments(list);
  }

  // ==========================================
  // MASTER DATA: ĐƠN VỊ / CƠ QUAN TRỰC THUỘC & ĐỐI TÁC (UNITS)
  // ==========================================
  static getUnits(): UnitItem[] {
    try {
      const data = localStorage.getItem(KEYS.UNITS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_UNITS;
  }

  static saveUnits(units: UnitItem[]): void {
    localStorage.setItem(KEYS.UNITS, JSON.stringify(units));
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'units' } }));
  }

  static addUnit(unit: UnitItem): void {
    const list = this.getUnits();
    list.unshift(unit);
    this.saveUnits(list);
  }

  static updateUnit(id: string, updates: Partial<UnitItem>): void {
    const list = this.getUnits();
    const idx = list.findIndex(u => u.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.saveUnits(list);
    }
  }

  static deleteUnit(id: string): void {
    const list = this.getUnits().filter(u => u.id !== id);
    this.saveUnits(list);
  }

  // ==========================================
  // MASTER DATA: ĐƠN VỊ BAN HÀNH (ISSUING AGENCIES)
  // ==========================================
  static getIssuingAgencies(): IssuingAgencyItem[] {
    try {
      const data = localStorage.getItem(KEYS.ISSUING_AGENCIES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ISSUING_AGENCIES;
  }

  static saveIssuingAgencies(agencies: IssuingAgencyItem[]): void {
    localStorage.setItem(KEYS.ISSUING_AGENCIES, JSON.stringify(agencies));
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'issuing_agencies' } }));
  }

  static addIssuingAgency(agency: IssuingAgencyItem): void {
    const list = this.getIssuingAgencies();
    list.unshift(agency);
    this.saveIssuingAgencies(list);
  }

  static updateIssuingAgency(id: string, updates: Partial<IssuingAgencyItem>): void {
    const list = this.getIssuingAgencies();
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.saveIssuingAgencies(list);
    }
  }

  static deleteIssuingAgency(id: string): void {
    const list = this.getIssuingAgencies().filter(a => a.id !== id);
    this.saveIssuingAgencies(list);
  }

  // ==========================================
  // MASTER DATA: TÀI KHOẢN NGƯỜI DÙNG (USERS)
  // ==========================================
  static getUsers(): UserProfile[] {
    try {
      const data = localStorage.getItem(KEYS.USERS);
      if (data) {
        const parsed: UserProfile[] = JSON.parse(data);
        const existingIds = new Set(parsed.map(u => u.id));
        let hasChanges = false;
        SAMPLE_USERS.forEach(sample => {
          if (!existingIds.has(sample.id)) {
            parsed.unshift(sample);
            hasChanges = true;
          }
        });
        if (hasChanges) {
          localStorage.setItem(KEYS.USERS, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_USERS;
  }

  static saveUsers(users: UserProfile[]): void {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'users' } }));
  }

  static addUser(user: UserProfile): void {
    const list = this.getUsers();
    list.push(user);
    this.saveUsers(list);
  }

  static updateUser(id: string, updates: Partial<UserProfile>): void {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.saveUsers(list);
      // If updating current logged in user, update current user too
      const current = this.getCurrentUser();
      if (current.id === id) {
        this.setCurrentUser(list[idx]);
      }
    }
  }

  static deleteUser(id: string): void {
    const list = this.getUsers().filter(u => u.id !== id);
    this.saveUsers(list);
  }

  // Metadata Schemas for Document Types
  static getMetadataSchemas(): DocTypeMetadataSchema[] {
    try {
      const data = localStorage.getItem(KEYS.METADATA_SCHEMAS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_METADATA_SCHEMAS;
  }

  static saveMetadataSchemas(schemas: DocTypeMetadataSchema[]): void {
    localStorage.setItem(KEYS.METADATA_SCHEMAS, JSON.stringify(schemas));
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'metadata_schemas' } }));
  }

  static getSchemaForDocType(docType: string): DocTypeMetadataSchema | undefined {
    if (!docType) return undefined;
    const schemas = this.getMetadataSchemas();
    const query = docType.trim().toLowerCase();
    
    return schemas.find(s => {
      const mainName = s.docType.toLowerCase();
      if (mainName === query) return true;
      if (s.aliases && s.aliases.some(a => a.toLowerCase() === query || query.includes(a.toLowerCase()) || a.toLowerCase().includes(query))) {
        return true;
      }
      return mainName.includes(query) || query.includes(mainName);
    });
  }

  static addOrUpdateSchema(schema: DocTypeMetadataSchema): void {
    const schemas = this.getMetadataSchemas();
    const idx = schemas.findIndex(s => s.id === schema.id);
    if (idx !== -1) {
      schemas[idx] = { ...schema, updatedAt: new Date().toISOString() };
    } else {
      schemas.push({ ...schema, updatedAt: new Date().toISOString() });
    }
    this.saveMetadataSchemas(schemas);
  }

  static deleteSchema(id: string): void {
    const schemas = this.getMetadataSchemas().filter(s => s.id !== id);
    this.saveMetadataSchemas(schemas);
  }

  // Reset all to sample data
  static resetToDefault(): void {
    localStorage.setItem(KEYS.BRAND, JSON.stringify(DEFAULT_BRAND_CONFIG));
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(SAMPLE_USERS[0]));
    localStorage.setItem(KEYS.EXISTING_DOCS, JSON.stringify(INITIAL_EXISTING_DOCS));
    localStorage.setItem(KEYS.DRAFTS, JSON.stringify(INITIAL_DRAFTS));
    localStorage.setItem(KEYS.INCOMING, JSON.stringify(INITIAL_INCOMING_DOCS));
    localStorage.setItem(KEYS.OUTGOING, JSON.stringify(INITIAL_OUTGOING_DOCS));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(DEFAULT_DEPARTMENTS));
    localStorage.setItem(KEYS.UNITS, JSON.stringify(DEFAULT_UNITS));
    localStorage.setItem(KEYS.ISSUING_AGENCIES, JSON.stringify(DEFAULT_ISSUING_AGENCIES));
    localStorage.setItem(KEYS.USERS, JSON.stringify(SAMPLE_USERS));
    localStorage.setItem(KEYS.METADATA_SCHEMAS, JSON.stringify(DEFAULT_METADATA_SCHEMAS));
    window.dispatchEvent(new CustomEvent('hstl_state_change', { detail: { type: 'all_reset' } }));
  }
}
