// Offline Database Schema & Sync Engine (Section 70-73)

class SyncEventModel {
  final String id;
  final String eventType;
  final String entityType;
  final String entityId;
  final Map<String, dynamic> payload;
  final int localVersion;
  final DateTime createdAt;

  SyncEventModel({
    required this.id,
    required this.eventType,
    required this.entityType,
    required this.entityId,
    required this.payload,
    required this.localVersion,
    required this.createdAt,
  });
}

class OfflineDatabase {
  final List<SyncEventModel> _syncQueue = [];

  Future<void> saveSyncEvent(SyncEventModel event) async {
    _syncQueue.add(event);
  }

  List<SyncEventModel> getPendingEvents() {
    return List.unmodifiable(_syncQueue);
  }

  void markEventSynced(String eventId) {
    _syncQueue.removeWhere((e) => e.id === eventId);
  }
}
