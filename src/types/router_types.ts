export interface RouterDevice {
  id: number;
  imei: string;
  imsi: string | null;
  iccid: string | null;
  model: string | null;
  serial_number: string | null;
  firmware_version: string | null;
  site_name: string;
  wan_ip: string | null;
  status: "online" | "offline";
  last_seen: string | null;
  created_at: string;
  rsrp_dbm: number | null;
  rssi_dbm: number | null;
  rsrq_db: number | null;
  sinr_db: string | null;
  signal_grade: "Excellent" | "Good" | "Fair" | "Poor" | "Critical" | "Unknown";
  cell_id: string | null;
  cell_pci: string | null;
  lte_band: string | null;
  connected_devices_total: number;
  wifi_devices_count: number;
  download_bytes_total: number;
  upload_bytes_total: number;
  download_delta_bytes: number;
  upload_delta_bytes: number;
  download_total_gb: number;
  upload_total_gb: number;
  download_delta_kb: number;
  upload_delta_kb: number;
}

export interface TelemetryRecord {
  id: number;
  imei: string;
  rsrp_dbm: number | null;
  rssi_dbm: number | null;
  rsrq_db: number | null;
  sinr_db: string | null;
  signal_grade: string;
  cell_id: string | null;
  cell_pci: string | null;
  lte_band: string | null;
  connected_devices_total: number;
  wifi_devices_count: number;
  download_bytes_total: number;
  upload_bytes_total: number;
  download_delta_bytes: number;
  upload_delta_bytes: number;
  download_total_gb: number;
  upload_total_gb: number;
  download_delta_kb: number;
  upload_delta_kb: number;
  timestamp: string;
}

export interface SystemHealth {
  status: string;
  service: string;
  total_routers: number;
  online_routers: number;
  offline_routers: number;
  database: string;
}
