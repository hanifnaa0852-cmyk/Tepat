import {
  DecisionState,
  FpFnLogRow,
  PebRecord,
  RefBkRow,
} from '../types/tepat';

/** Tanggal acuan operasional harian H+1 untuk prototipe */
export const DEFAULT_REFERENCE_DATE = new Date(2026, 10, 24); // 24 November 2026

export const EKSPORTIR_LIST = [
  'Kelapa Sentosa Lestari',
  'Kelapa Tirta Lestari',
  'Palma Dirga Perkasa',
  'Sawit Rajawali Perkasa',
  'Sawit Persada Nusantara',
  'Sawit Nusa Lestari',
  'Minyak Utama Lestari',
  'Kakao Samudra Sulawesi',
  'Cokelat Prima Sulawesi',
  'Cokelat Wahana Sulawesi',
] as const;

/**
 * Tabel rujukan Ref_BK (JSON yang dapat disunting langsung di antarmuka).
 * Nilai bersifat CONTOH untuk demonstrasi, ganti sesuai PMK/Kepmenkeu bulan berjalan.
 */
export const INITIAL_REF_BK: RefBkRow[] = [
  // 2024-11
  {
    id: 'ref-2024-11-cpo',
    bulan: '2024-11',
    komoditas: 'CPO',
    pos_tarif: '1511.10.00',
    jenjang_harga: 'USD 900 - 950/MT (CONTOH)',
    tarif: 10,
    hpe: 14_500_000,
  },
  {
    id: 'ref-2024-11-olein',
    bulan: '2024-11',
    komoditas: 'RBD Palm Olein',
    pos_tarif: '1511.90.37',
    jenjang_harga: 'USD 900 - 950/MT (CONTOH)',
    tarif: 5,
    hpe: 15_200_000,
  },
  {
    id: 'ref-2024-11-cpko',
    bulan: '2024-11',
    komoditas: 'CPKO',
    pos_tarif: '1513.21.10',
    jenjang_harga: 'USD 950 - 1.000/MT (CONTOH)',
    tarif: 7.5,
    hpe: 15_800_000,
  },
  {
    id: 'ref-2024-11-kakao',
    bulan: '2024-11',
    komoditas: 'Biji Kakao',
    pos_tarif: '1801.00.00',
    jenjang_harga: 'HPE Kakao Tahap III (CONTOH)',
    tarif: 10,
    hpe: 82_000_000,
  },
  // 2025-02
  {
    id: 'ref-2025-02-cpo',
    bulan: '2025-02',
    komoditas: 'CPO',
    pos_tarif: '1511.10.00',
    jenjang_harga: 'USD 900 - 950/MT (CONTOH)',
    tarif: 10,
    hpe: 14_800_000,
  },
  {
    id: 'ref-2025-02-olein',
    bulan: '2025-02',
    komoditas: 'RBD Palm Olein',
    pos_tarif: '1511.90.37',
    jenjang_harga: 'USD 900 - 950/MT (CONTOH)',
    tarif: 5,
    hpe: 15_400_000,
  },
  {
    id: 'ref-2025-02-kakao',
    bulan: '2025-02',
    komoditas: 'Biji Kakao',
    pos_tarif: '1801.00.00',
    jenjang_harga: 'HPE Kakao Tahap III (CONTOH)',
    tarif: 10,
    hpe: 85_000_000,
  },
  // 2025-08
  {
    id: 'ref-2025-08-cpo',
    bulan: '2025-08',
    komoditas: 'CPO',
    pos_tarif: '1511.10.00',
    jenjang_harga: 'USD 900 - 950/MT (CONTOH)',
    tarif: 10,
    hpe: 15_000_000,
  },
  {
    id: 'ref-2025-08-olein',
    bulan: '2025-08',
    komoditas: 'RBD Palm Olein',
    pos_tarif: '1511.90.37',
    jenjang_harga: 'USD 900 - 950/MT (CONTOH)',
    tarif: 5,
    hpe: 15_600_000,
  },
  {
    id: 'ref-2025-08-kakao',
    bulan: '2025-08',
    komoditas: 'Biji Kakao',
    pos_tarif: '1801.00.00',
    jenjang_harga: 'HPE Kakao Tahap III (CONTOH)',
    tarif: 10,
    hpe: 90_000_000,
  },
  // 2026-06
  {
    id: 'ref-2026-06-cpo',
    bulan: '2026-06',
    komoditas: 'CPO',
    pos_tarif: '1511.10.00',
    jenjang_harga: 'USD 900 - 950/MT (CONTOH)',
    tarif: 10,
    hpe: 15_200_000,
  },
  {
    id: 'ref-2026-06-olein',
    bulan: '2026-06',
    komoditas: 'RBD Palm Olein',
    pos_tarif: '1511.90.37',
    jenjang_harga: 'USD 900 - 950/MT (CONTOH)',
    tarif: 5,
    hpe: 15_800_000,
  },
  {
    id: 'ref-2026-06-stearin',
    bulan: '2026-06',
    komoditas: 'RBD Palm Stearin',
    pos_tarif: '1511.90.39',
    jenjang_harga: 'USD 900 - 950/MT (CONTOH)',
    tarif: 5,
    hpe: 15_500_000,
  },
  {
    id: 'ref-2026-06-cpko',
    bulan: '2026-06',
    komoditas: 'CPKO',
    pos_tarif: '1513.21.10',
    jenjang_harga: 'USD 950 - 1.000/MT (CONTOH)',
    tarif: 7.5,
    hpe: 16_300_000,
  },
  {
    id: 'ref-2026-06-cco',
    bulan: '2026-06',
    komoditas: 'Crude Coconut Oil',
    pos_tarif: '1513.11.00',
    jenjang_harga: 'USD 950 - 1.000/MT (CONTOH)',
    tarif: 5,
    hpe: 16_800_000,
  },
  {
    id: 'ref-2026-06-kakao',
    bulan: '2026-06',
    komoditas: 'Biji Kakao',
    pos_tarif: '1801.00.00',
    jenjang_harga: 'HPE Kakao Tahap III (CONTOH)',
    tarif: 10,
    hpe: 92_000_000,
  },
  // 2026-10
  {
    id: 'ref-2026-10-cpo',
    bulan: '2026-10',
    komoditas: 'CPO',
    pos_tarif: '1511.10.00',
    jenjang_harga: 'USD 920 - 970/MT (CONTOH)',
    tarif: 10,
    hpe: 15_500_000,
  },
  {
    id: 'ref-2026-10-olein',
    bulan: '2026-10',
    komoditas: 'RBD Palm Olein',
    pos_tarif: '1511.90.37',
    jenjang_harga: 'USD 920 - 970/MT (CONTOH)',
    tarif: 5,
    hpe: 16_000_000,
  },
  {
    id: 'ref-2026-10-stearin',
    bulan: '2026-10',
    komoditas: 'RBD Palm Stearin',
    pos_tarif: '1511.90.39',
    jenjang_harga: 'USD 920 - 970/MT (CONTOH)',
    tarif: 5,
    hpe: 15_700_000,
  },
  {
    id: 'ref-2026-10-cpko',
    bulan: '2026-10',
    komoditas: 'CPKO',
    pos_tarif: '1513.21.10',
    jenjang_harga: 'USD 950 - 1.000/MT (CONTOH)',
    tarif: 7.5,
    hpe: 16_500_000,
  },
  {
    id: 'ref-2026-10-cco',
    bulan: '2026-10',
    komoditas: 'Crude Coconut Oil',
    pos_tarif: '1513.11.00',
    jenjang_harga: 'USD 950 - 1.000/MT (CONTOH)',
    tarif: 5,
    hpe: 17_000_000,
  },
  {
    id: 'ref-2026-10-kakao',
    bulan: '2026-10',
    komoditas: 'Biji Kakao',
    pos_tarif: '1801.00.00',
    jenjang_harga: 'HPE Kakao Tahap III (CONTOH)',
    tarif: 10,
    hpe: 95_000_000,
  },
  // 2026-11 (Bulan berjalan)
  {
    id: 'ref-2026-11-cpo',
    bulan: '2026-11',
    komoditas: 'CPO',
    pos_tarif: '1511.10.00',
    jenjang_harga: 'USD 930 - 980/MT (CONTOH)',
    tarif: 10,
    hpe: 15_600_000,
  },
  {
    id: 'ref-2026-11-olein',
    bulan: '2026-11',
    komoditas: 'RBD Palm Olein',
    pos_tarif: '1511.90.37',
    jenjang_harga: 'USD 930 - 980/MT (CONTOH)',
    tarif: 5,
    hpe: 16_200_000,
  },
  {
    id: 'ref-2026-11-stearin',
    bulan: '2026-11',
    komoditas: 'RBD Palm Stearin',
    pos_tarif: '1511.90.39',
    jenjang_harga: 'USD 930 - 980/MT (CONTOH)',
    tarif: 5,
    hpe: 15_900_000,
  },
  {
    id: 'ref-2026-11-cpko',
    bulan: '2026-11',
    komoditas: 'CPKO',
    pos_tarif: '1513.21.10',
    jenjang_harga: 'USD 960 - 1.010/MT (CONTOH)',
    tarif: 7.5,
    hpe: 16_800_000,
  },
  {
    id: 'ref-2026-11-cco',
    bulan: '2026-11',
    komoditas: 'Crude Coconut Oil',
    pos_tarif: '1513.11.00',
    jenjang_harga: 'USD 960 - 1.010/MT (CONTOH)',
    tarif: 5,
    hpe: 17_200_000,
  },
  {
    id: 'ref-2026-11-kakao',
    bulan: '2026-11',
    komoditas: 'Biji Kakao',
    pos_tarif: '1801.00.00',
    jenjang_harga: 'HPE Kakao Tahap III (CONTOH)',
    tarif: 10,
    hpe: 95_000_000,
  },
];

/**
 * Menghasilkan 180 baris PEB sintetis untuk demonstrasi dan uji balik:
 * - 23 PEB sengaja salah (10 R1, 7 R2, 6 R3): 5 pada 2024-2025, 18 pada 2026
 * - 157 PEB bersih: 39 pada 2024-2025, 118 pada 2026
 * - Total = 180 PEB (44 pada 2024-2025, 136 pada 2026)
 */
export function generateSyntheticPebs(): PebRecord[] {
  const flaggedPebs: PebRecord[] = [
    // === 2024-2025: 5 KASUS (2 R1, 2 R2, 1 R3) ===
    {
      nomor_peb: '000801',
      tanggal_peb: '2024-11-12',
      eksportir: 'Palma Dirga Perkasa',
      komoditas: 'CPO',
      uraian_barang: 'MINYAK SAWIT MENTAH (CPO) CURAH',
      pos_tarif: '1511.10.00',
      nilai_fob: 2_400_000_000,
      jumlah: 200,
      tarif_diberitahukan: 5, // R1: Ref 2024-11 = 10% -> selisih 120 jt
      _label_uji_balik: 'R1',
    },
    {
      nomor_peb: '001047',
      tanggal_peb: '2025-02-18',
      eksportir: 'Kakao Samudra Sulawesi',
      komoditas: 'Biji Kakao',
      uraian_barang: 'BIJI KAKAO FERMENTASI KERING MUTU I',
      pos_tarif: '1801.00.00',
      nilai_fob: 2_600_000_000, // 65 jt/MT vs HPE 85 jt/MT
      jumlah: 40,
      tarif_diberitahukan: 10, // R2: selisih 80 jt
      _label_uji_balik: 'R2',
    },
    {
      nomor_peb: '001290',
      tanggal_peb: '2025-02-22',
      eksportir: 'Sawit Rajawali Perkasa',
      komoditas: 'RBD Palm Olein',
      uraian_barang: 'CRUDE PALM OIL (CPO) IN FLEXIBAG',
      pos_tarif: '1511.90.37', // R3: seharusnya 1511.10.00 (tarif 10% vs 5%) -> selisih 90 jt
      nilai_fob: 1_800_000_000,
      jumlah: 150,
      tarif_diberitahukan: 5,
      _label_uji_balik: 'R3',
    },
    {
      nomor_peb: '001512',
      tanggal_peb: '2025-08-10',
      eksportir: 'Minyak Utama Lestari',
      komoditas: 'RBD Palm Olein',
      uraian_barang: 'RBD PALM OLEIN DALAM KEMASAN TANGKI',
      pos_tarif: '1511.90.37',
      nilai_fob: 1_750_000_000,
      jumlah: 140,
      tarif_diberitahukan: 3, // R1: Ref 2025-08 = 5% -> selisih 35 jt (Reguler)
      _label_uji_balik: 'R1',
    },
    {
      nomor_peb: '001688',
      tanggal_peb: '2025-08-19',
      eksportir: 'Cokelat Prima Sulawesi',
      komoditas: 'Biji Kakao',
      uraian_barang: 'BIJI KAKAO KERING EKSPOR',
      pos_tarif: '1801.00.00',
      nilai_fob: 2_100_000_000, // 70 jt/MT vs HPE 90 jt/MT
      jumlah: 30,
      tarif_diberitahukan: 10, // R2: selisih 60 jt
      _label_uji_balik: 'R2',
    },

    // === 2026: 18 KASUS (8 R1, 5 R2, 5 R3) ===
    {
      nomor_peb: '002385',
      tanggal_peb: '2026-10-29', // Sisa 4 hari dari 2026-11-24
      eksportir: 'Sawit Persada Nusantara',
      komoditas: 'CPO',
      uraian_barang: 'MINYAK SAWIT MENTAH (CPO) CURAH',
      pos_tarif: '1511.10.00',
      nilai_fob: 4_800_000_000,
      jumlah: 320,
      tarif_diberitahukan: 7.5, // R1: Ref 10% -> selisih 120 jt
      _label_uji_balik: 'R1',
    },
    {
      nomor_peb: '002455',
      tanggal_peb: '2026-11-01', // Sisa 7 hari dari 2026-11-24
      eksportir: 'Sawit Nusa Lestari',
      komoditas: 'CPO',
      uraian_barang: 'MINYAK SAWIT MENTAH (CPO) KAPAL TANGKI',
      pos_tarif: '1511.10.00',
      nilai_fob: 3_100_000_000,
      jumlah: 210,
      tarif_diberitahukan: 5, // R1: Ref 10% -> selisih 155 jt
      _label_uji_balik: 'R1',
    },
    {
      nomor_peb: '002604',
      tanggal_peb: '2026-11-06', // Sisa 12 hari dari 2026-11-24
      eksportir: 'Kelapa Sentosa Lestari',
      komoditas: 'CPKO',
      uraian_barang: 'CRUDE PALM KERNEL OIL (CPKO) IN BULK',
      pos_tarif: '1513.21.10',
      nilai_fob: 2_800_000_000,
      jumlah: 180,
      tarif_diberitahukan: 5, // R1: Ref 7.5% -> selisih 70 jt (memuat CRUDE + R1)
      _label_uji_balik: 'R1',
    },
    {
      nomor_peb: '002667',
      tanggal_peb: '2026-11-10', // Sisa 16 hari
      eksportir: 'Palma Dirga Perkasa',
      komoditas: 'CPO',
      uraian_barang: 'MINYAK SAWIT MENTAH (CPO) CURAH',
      pos_tarif: '1511.10.00',
      nilai_fob: 3_600_000_000,
      jumlah: 240,
      tarif_diberitahukan: 7.5, // R1: Ref 10% -> selisih 90 jt
      _label_uji_balik: 'R1',
    },
    {
      nomor_peb: '002698',
      tanggal_peb: '2026-11-08', // Sisa 14 hari
      eksportir: 'Cokelat Wahana Sulawesi',
      komoditas: 'Biji Kakao',
      uraian_barang: 'BIJI KAKAO FERMENTASI MUTU EKSPOR',
      pos_tarif: '1801.00.00',
      nilai_fob: 4_500_000_000, // 75 jt/MT vs HPE 95 jt/MT
      jumlah: 60,
      tarif_diberitahukan: 10, // R2: selisih 120 jt
      _label_uji_balik: 'R2',
    },
    {
      nomor_peb: '002705',
      tanggal_peb: '2026-11-09', // Sisa 15 hari
      eksportir: 'Sawit Rajawali Perkasa',
      komoditas: 'RBD Palm Olein',
      uraian_barang: 'CRUDE PALM OIL (CPO) IN FLEXIBAG',
      pos_tarif: '1511.90.37', // R3 -> selisih 135 jt
      nilai_fob: 2_700_000_000,
      jumlah: 180,
      tarif_diberitahukan: 5,
      _label_uji_balik: 'R3',
    },
    {
      nomor_peb: '002712',
      tanggal_peb: '2026-11-12', // Sisa 18 hari
      eksportir: 'Sawit Rajawali Perkasa',
      komoditas: 'RBD Palm Olein',
      uraian_barang: 'RBD PALM OLEIN CURAH',
      pos_tarif: '1511.90.37',
      nilai_fob: 1_900_000_000,
      jumlah: 120,
      tarif_diberitahukan: 3, // R1: Ref 5% -> selisih 38 jt (Reguler)
      _label_uji_balik: 'R1',
    },
    {
      nomor_peb: '002731',
      tanggal_peb: '2026-11-11', // Sisa 17 hari
      eksportir: 'Kakao Samudra Sulawesi',
      komoditas: 'Biji Kakao',
      uraian_barang: 'BIJI KAKAO KERING GRADE A',
      pos_tarif: '1801.00.00',
      nilai_fob: 3_900_000_000, // 78 jt/MT vs HPE 95 jt/MT
      jumlah: 50,
      tarif_diberitahukan: 10, // R2: selisih 85 jt
      _label_uji_balik: 'R2',
    },
    {
      nomor_peb: '002745',
      tanggal_peb: '2026-11-14', // Sisa 20 hari
      eksportir: 'Kelapa Tirta Lestari',
      komoditas: 'Crude Coconut Oil',
      uraian_barang: 'MINYAK KELAPA MENTAH CURAH',
      pos_tarif: '1513.11.00',
      nilai_fob: 1_400_000_000,
      jumlah: 85,
      tarif_diberitahukan: 3, // R1: Ref 5% -> selisih 28 jt (Reguler)
      _label_uji_balik: 'R1',
    },
    {
      nomor_peb: '002752',
      tanggal_peb: '2026-11-13', // Sisa 19 hari
      eksportir: 'Palma Dirga Perkasa',
      komoditas: 'RBD Palm Olein',
      uraian_barang: 'CRUDE PALM OIL (CPO) IN FLEXIBAG',
      pos_tarif: '1511.90.37', // R3 -> selisih 110 jt
      nilai_fob: 2_200_000_000,
      jumlah: 150,
      tarif_diberitahukan: 5,
      _label_uji_balik: 'R3',
    },
    {
      nomor_peb: '002764',
      tanggal_peb: '2026-11-15', // Sisa 21 hari
      eksportir: 'Cokelat Prima Sulawesi',
      komoditas: 'Biji Kakao',
      uraian_barang: 'BIJI KAKAO FERMENTASI KERING',
      pos_tarif: '1801.00.00',
      nilai_fob: 3_600_000_000, // 80 jt/MT vs HPE 95 jt/MT
      jumlah: 45,
      tarif_diberitahukan: 10, // R2: selisih 67.5 jt
      _label_uji_balik: 'R2',
    },
    {
      nomor_peb: '002788',
      tanggal_peb: '2026-11-16', // Sisa 22 hari
      eksportir: 'Sawit Nusa Lestari',
      komoditas: 'RBD Palm Olein',
      uraian_barang: 'CRUDE PALM OIL (CPO) IN FLEXIBAG',
      pos_tarif: '1511.90.37', // R3 -> selisih 98 jt
      nilai_fob: 1_960_000_000,
      jumlah: 130,
      tarif_diberitahukan: 5,
      _label_uji_balik: 'R3',
    },
    {
      nomor_peb: '002791',
      tanggal_peb: '2026-11-17', // Sisa 23 hari
      eksportir: 'Minyak Utama Lestari',
      komoditas: 'CPO',
      uraian_barang: 'MINYAK SAWIT MENTAH (CPO) CURAH',
      pos_tarif: '1511.10.00',
      nilai_fob: 4_200_000_000,
      jumlah: 270,
      tarif_diberitahukan: 7.5, // R1: Ref 10% -> selisih 105 jt
      _label_uji_balik: 'R1',
    },
    {
      nomor_peb: '002809',
      tanggal_peb: '2026-11-18', // Sisa 24 hari
      eksportir: 'Cokelat Wahana Sulawesi',
      komoditas: 'Biji Kakao',
      uraian_barang: 'BIJI KAKAO KERING EKSPOR',
      pos_tarif: '1801.00.00',
      nilai_fob: 2_075_000_000, // 83 jt/MT vs HPE 95 jt/MT
      jumlah: 25,
      tarif_diberitahukan: 10, // R2: selisih 30 jt (Reguler)
      _label_uji_balik: 'R2',
    },
    {
      nomor_peb: '002820',
      tanggal_peb: '2026-11-20', // Sisa 26 hari
      eksportir: 'Minyak Utama Lestari',
      komoditas: 'RBD Palm Olein',
      uraian_barang: 'CRUDE PALM OIL (CPO) IN FLEXIBAG',
      pos_tarif: '1511.90.37', // R3 -> selisih 84 jt
      nilai_fob: 1_680_000_000,
      jumlah: 115,
      tarif_diberitahukan: 5,
      _label_uji_balik: 'R3',
    },
    {
      nomor_peb: '002834',
      tanggal_peb: '2026-11-21', // Sisa 27 hari
      eksportir: 'Sawit Persada Nusantara',
      komoditas: 'RBD Palm Stearin',
      uraian_barang: 'RBD PALM STEARIN CURAH',
      pos_tarif: '1511.90.39',
      nilai_fob: 2_200_000_000,
      jumlah: 140,
      tarif_diberitahukan: 3, // R1: Ref 5% -> selisih 44 jt (Reguler)
      _label_uji_balik: 'R1',
    },
    {
      nomor_peb: '002849',
      tanggal_peb: '2026-11-23', // H+1 kemarin -> sisa 29 hari
      eksportir: 'Kakao Samudra Sulawesi',
      komoditas: 'Biji Kakao',
      uraian_barang: 'BIJI KAKAO FERMENTASI GRADE I',
      pos_tarif: '1801.00.00',
      nilai_fob: 4_235_000_000, // 77 jt/MT vs HPE 95 jt/MT
      jumlah: 55,
      tarif_diberitahukan: 10, // R2: selisih 99 jt
      _label_uji_balik: 'R2',
    },
    {
      nomor_peb: '002853',
      tanggal_peb: '2026-11-23', // H+1 kemarin -> sisa 29 hari
      eksportir: 'Sawit Persada Nusantara',
      komoditas: 'RBD Palm Olein',
      uraian_barang: 'CRUDE PALM OIL (CPO) IN FLEXIBAG',
      pos_tarif: '1511.90.37', // R3 -> selisih 48 jt (Reguler)
      nilai_fob: 960_000_000,
      jumlah: 65,
      tarif_diberitahukan: 5,
      _label_uji_balik: 'R3',
    },
  ];

  // === 157 PEB BERSIH (39 pada 2024-2025, 118 pada 2026) ===
  const cleanPebs: PebRecord[] = [];
  const palmExporters = EKSPORTIR_LIST.slice(0, 7);
  const kakaoExporters = EKSPORTIR_LIST.slice(7, 10);

  const pad6 = (n: number) => String(n).padStart(6, '0');

  // Helper untuk membuat baris bersih
  const makeCleanRow = (
    seq: number,
    tanggal: string,
    kind: 'CPO_OK' | 'CPKO_CRUDE_OK' | 'CCO_CRUDE_OK' | 'OLEIN_FLEX_OK' | 'STEARIN_FLEX_OK' | 'KAKAO_OK'
  ): PebRecord => {
    const idxPalm = seq % palmExporters.length;
    const idxKakao = seq % kakaoExporters.length;
    const bulan = tanggal.slice(0, 7);

    switch (kind) {
      case 'CPKO_CRUDE_OK':
        return {
          nomor_peb: pad6(seq),
          tanggal_peb: tanggal,
          eksportir: palmExporters[idxPalm],
          komoditas: 'CPKO',
          uraian_barang: 'CRUDE PALM KERNEL OIL (CPKO) IN DRUM',
          pos_tarif: '1513.21.10',
          nilai_fob: 2_100_000_000 + (seq % 5) * 150_000_000,
          jumlah: 130 + (seq % 4) * 10,
          tarif_diberitahukan: 7.5,
          _label_uji_balik: 'BERSIH',
        };
      case 'CCO_CRUDE_OK':
        return {
          nomor_peb: pad6(seq),
          tanggal_peb: tanggal,
          eksportir: palmExporters[idxPalm],
          komoditas: 'Crude Coconut Oil',
          uraian_barang: 'CRUDE COCONUT OIL IN BULK',
          pos_tarif: '1513.11.00',
          nilai_fob: 1_850_000_000 + (seq % 4) * 120_000_000,
          jumlah: 110 + (seq % 3) * 10,
          tarif_diberitahukan: 5,
          _label_uji_balik: 'BERSIH',
        };
      case 'OLEIN_FLEX_OK':
        return {
          nomor_peb: pad6(seq),
          tanggal_peb: tanggal,
          eksportir: palmExporters[idxPalm],
          komoditas: 'RBD Palm Olein',
          uraian_barang: 'RBD PALM OLEIN IN FLEXIBAG',
          pos_tarif: '1511.90.37',
          nilai_fob: 2_250_000_000 + (seq % 6) * 100_000_000,
          jumlah: 145 + (seq % 5) * 10,
          tarif_diberitahukan: 5,
          _label_uji_balik: 'BERSIH',
        };
      case 'STEARIN_FLEX_OK':
        return {
          nomor_peb: pad6(seq),
          tanggal_peb: tanggal,
          eksportir: palmExporters[idxPalm],
          komoditas: 'RBD Palm Stearin',
          uraian_barang: 'RBD PALM STEARIN IN FLEXIBAG',
          pos_tarif: '1511.90.39',
          nilai_fob: 1_950_000_000 + (seq % 5) * 110_000_000,
          jumlah: 125 + (seq % 4) * 10,
          tarif_diberitahukan: 5,
          _label_uji_balik: 'BERSIH',
        };
      case 'KAKAO_OK': {
        const hpe =
          bulan === '2024-11'
            ? 82_000_000
            : bulan === '2025-02'
              ? 85_000_000
              : bulan === '2025-08'
                ? 90_000_000
                : bulan === '2026-06'
                  ? 92_000_000
                  : 95_000_000;
        const qty = 35 + (seq % 4) * 5;
        return {
          nomor_peb: pad6(seq),
          tanggal_peb: tanggal,
          eksportir: kakaoExporters[idxKakao],
          komoditas: 'Biji Kakao',
          uraian_barang: 'BIJI KAKAO FERMENTASI KERING MUTU I',
          pos_tarif: '1801.00.00',
          nilai_fob: (hpe + 4_000_000) * qty,
          jumlah: qty,
          tarif_diberitahukan: 10,
          _label_uji_balik: 'BERSIH',
        };
      }
      case 'CPO_OK':
      default:
        return {
          nomor_peb: pad6(seq),
          tanggal_peb: tanggal,
          eksportir: palmExporters[idxPalm],
          komoditas: 'CPO',
          uraian_barang: 'CRUDE PALM OIL (CPO) IN BULK VESSEL',
          pos_tarif: '1511.10.00',
          nilai_fob: 3_500_000_000 + (seq % 7) * 150_000_000,
          jumlah: 230 + (seq % 5) * 15,
          tarif_diberitahukan: 10,
          _label_uji_balik: 'BERSIH',
        };
    }
  };

  // 39 PEB bersih periode 2024-2025:
  // Memuat 5 CPKO_CRUDE_OK + 5 OLEIN_FLEX_OK + 19 CPO_OK + 10 KAKAO_OK = 39
  const dates24_25 = [
    '2024-11-05',
    '2024-11-14',
    '2024-11-22',
    '2025-02-06',
    '2025-02-15',
    '2025-02-25',
    '2025-08-04',
    '2025-08-14',
    '2025-08-26',
  ];
  for (let i = 0; i < 39; i += 1) {
    const tanggal = dates24_25[i % dates24_25.length];
    const seq = 700 + i * 27;
    let kind: Parameters<typeof makeCleanRow>[2] = 'CPO_OK';
    if (i < 5) kind = 'CPKO_CRUDE_OK';
    else if (i < 10) kind = 'OLEIN_FLEX_OK';
    else if (i < 20) kind = 'KAKAO_OK';
    cleanPebs.push(makeCleanRow(seq, tanggal, kind));
  }

  // 118 PEB bersih periode 2026:
  // Memuat 14 CPKO_CRUDE_OK/CCO_CRUDE_OK (total CRUDE bersih = 5 + 14 = 19)
  // Memuat 18 OLEIN_FLEX_OK/STEARIN_FLEX_OK (total FLEXIBAG bersih = 5 + 18 = 23)
  // Memuat 56 CPO_OK + 30 KAKAO_OK = 118
  const dates26 = [
    '2026-06-12',
    '2026-06-20',
    '2026-10-18',
    '2026-10-27',
    '2026-11-04',
    '2026-11-10',
    '2026-11-15',
    '2026-11-19',
    '2026-11-22',
    '2026-11-23',
  ];
  for (let i = 0; i < 118; i += 1) {
    const tanggal = dates26[i % dates26.length];
    const seq = 2100 + i * 7;
    let kind: Parameters<typeof makeCleanRow>[2] = 'CPO_OK';
    if (i < 9) kind = 'CPKO_CRUDE_OK';
    else if (i < 14) kind = 'CCO_CRUDE_OK';
    else if (i < 26) kind = 'OLEIN_FLEX_OK';
    else if (i < 32) kind = 'STEARIN_FLEX_OK';
    else if (i < 62) kind = 'KAKAO_OK';
    cleanPebs.push(makeCleanRow(seq, tanggal, kind));
  }

  // Gabungkan & urutkan berdasarkan tanggal terbaru lebih dulu, lalu nomor PEB
  return [...flaggedPebs, ...cleanPebs].sort((a, b) => {
    if (a.tanggal_peb !== b.tanggal_peb) {
      return b.tanggal_peb.localeCompare(a.tanggal_peb);
    }
    return b.nomor_peb.localeCompare(a.nomor_peb);
  });
}

/** Keputusan awal untuk 5 kasus historis 2024-2025 agar demonstrasi lini masa lengkap */
export const INITIAL_DECISIONS: Record<string, DecisionState> = {
  '000801': {
    status: 'Ditetapkan',
    keputusanTerakhir: 'Tetapkan dalam 30 hari',
    catatanPejabat:
      'SPBK diterbitkan sesuai tarif Ref_BK November 2024 (10%). Eksportir telah menyetujui koreksi tarif.',
    ditandaiPalsu: false,
    riwayat: [
      {
        id: 'ev-801-1',
        tahap: 'Ditandai sistem',
        waktu: '2024-11-13 07:00 WIB',
        oleh: 'Mesin Saringan TEPAT',
        keterangan: 'Ditandai oleh R1: tarif PEB 5% tidak sesuai tarif Ref_BK 10%.',
      },
      {
        id: 'ev-801-2',
        tahap: 'Diverifikasi',
        waktu: '2024-11-15 10:15 WIB',
        oleh: 'PFPD Bea Keluar',
        keterangan: 'Dokumen pemberitahuan dan referensi tarif November 2024 terkonfirmasi.',
      },
      {
        id: 'ev-801-3',
        tahap: 'Diputuskan',
        waktu: '2024-11-18 14:30 WIB',
        oleh: 'PFPD Bea Keluar',
        keterangan: 'Tetapkan dalam 30 hari — SPBK kurang bayar Rp 120.000.000.',
      },
    ],
  },
  '001047': {
    status: 'Ditetapkan',
    keputusanTerakhir: 'Tetapkan dalam 30 hari',
    catatanPejabat:
      'Nilai FOB per MT lebih rendah dari HPE Biji Kakao Februari 2025. Ditetapkan kurang bayar.',
    ditandaiPalsu: false,
    riwayat: [
      {
        id: 'ev-1047-1',
        tahap: 'Ditandai sistem',
        waktu: '2025-02-19 07:00 WIB',
        oleh: 'Mesin Saringan TEPAT',
        keterangan: 'Ditandai oleh R2: nilai FOB/MT lebih rendah dari HPE 2025-02.',
      },
      {
        id: 'ev-1047-2',
        tahap: 'Diverifikasi',
        waktu: '2025-02-21 09:40 WIB',
        oleh: 'PFPD Bea Keluar',
        keterangan: 'Invoice penjualan dibandingkan dengan daftar HPE Februari 2025.',
      },
      {
        id: 'ev-1047-3',
        tahap: 'Diputuskan',
        waktu: '2025-02-25 15:10 WIB',
        oleh: 'PFPD Bea Keluar',
        keterangan: 'Tetapkan dalam 30 hari — penetapan selisih Rp 80.000.000.',
      },
    ],
  },
  '001290': {
    status: 'Ditetapkan',
    keputusanTerakhir: 'Tetapkan dalam 30 hari',
    catatanPejabat:
      'Hasil uji contoh barang dan BL menunjukkan CPO dalam flexibag, pos ditetapkan ke 1511.10.00.',
    ditandaiPalsu: false,
    riwayat: [
      {
        id: 'ev-1290-1',
        tahap: 'Ditandai sistem',
        waktu: '2025-02-23 07:00 WIB',
        oleh: 'Mesin Saringan TEPAT',
        keterangan: 'Ditandai oleh R3: uraian CPO in flexibag tetapi pos olein 1511.90.37.',
      },
      {
        id: 'ev-1290-2',
        tahap: 'Diputuskan',
        waktu: '2025-03-03 11:20 WIB',
        oleh: 'PFPD Bea Keluar',
        keterangan: 'Tetapkan dalam 30 hari — reklasifikasi pos tarif ke 1511.10.00.',
      },
    ],
  },
  '001512': {
    status: 'Diusulkan ke Kanwil',
    keputusanTerakhir: 'Usulkan ke Kanwil (lewat 30 hari, dalam 10 hari kerja)',
    catatanPejabat:
      'Usulan penetapan ulang tarif disampaikan ke Kanwil sesuai ketentuan lewat 30 hari.',
    ditandaiPalsu: false,
    riwayat: [
      {
        id: 'ev-1512-1',
        tahap: 'Ditandai sistem',
        waktu: '2025-08-11 07:00 WIB',
        oleh: 'Mesin Saringan TEPAT',
        keterangan: 'Ditandai oleh R1: tarif PEB 3% vs Ref_BK 5%.',
      },
      {
        id: 'ev-1512-2',
        tahap: 'Diputuskan',
        waktu: '2025-09-15 16:05 WIB',
        oleh: 'PFPD Bea Keluar',
        keterangan: 'Diusulkan ke Kanwil karena telah melewati batas 30 hari penetapan.',
      },
    ],
  },
  '001688': {
    status: 'Ditetapkan',
    keputusanTerakhir: 'Tetapkan dalam 30 hari',
    catatanPejabat: 'Penetapan HPE Kakao Agustus 2025 selesai dalam batas 30 hari.',
    ditandaiPalsu: false,
    riwayat: [
      {
        id: 'ev-1688-1',
        tahap: 'Ditandai sistem',
        waktu: '2025-08-20 07:00 WIB',
        oleh: 'Mesin Saringan TEPAT',
        keterangan: 'Ditandai oleh R2: nilai FOB/MT di bawah HPE Biji Kakao.',
      },
      {
        id: 'ev-1688-2',
        tahap: 'Diputuskan',
        waktu: '2025-08-29 13:45 WIB',
        oleh: 'PFPD Bea Keluar',
        keterangan: 'Tetapkan dalam 30 hari — selisih Bea Keluar Rp 60.000.000.',
      },
    ],
  },
};

export const INITIAL_FP_FN_LOG: FpFnLogRow[] = [
  {
    id: 'log-2025-01',
    bulan: '2025-02',
    tanda: 3,
    tandaPalsu: 0,
    terlewat: 0,
    aturanTerdampak: 'R1, R2, R3',
    tindakanRevisi: 'Pengecualian kata kunci CPKO dan RBD Palm Olein flexibag dipertahankan.',
  },
  {
    id: 'log-2025-08',
    bulan: '2025-08',
    tanda: 2,
    tandaPalsu: 0,
    terlewat: 0,
    aturanTerdampak: 'R1, R2',
    tindakanRevisi: 'Sinkronisasi format tanggal periode PMK pada tabel rujukan Ref_BK.',
  },
  {
    id: 'log-2026-10',
    bulan: '2026-10',
    tanda: 1,
    tandaPalsu: 0,
    terlewat: 0,
    aturanTerdampak: 'R1',
    tindakanRevisi: 'Tidak ada revisi kamus; ambang prioritas Rp50 juta terkalibrasi.',
  },
  {
    id: 'log-2026-11',
    bulan: '2026-11',
    tanda: 17,
    tandaPalsu: 0,
    terlewat: 0,
    aturanTerdampak: 'R1, R2, R3',
    tindakanRevisi: 'Baseline siap untuk validasi prospektif pilot triwulan I 2027.',
  },
];
