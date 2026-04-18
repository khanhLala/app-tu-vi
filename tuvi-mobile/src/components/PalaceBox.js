import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const PalaceBox = ({ data, isTarget = false }) => {
  if (!data) return <View style={styles.container} />;

  // Phân loại sao Tuần / Triệt để hiển thị nổi bật
  const hasTuan = data.tuan_triet?.includes('Tuần');
  const hasTriet = data.tuan_triet?.includes('Triệt');

  return (
    <View style={[styles.container, isTarget && styles.targetContainer]}>
      {/* Tên cung và Địa chi */}
      <View style={styles.header}>
        <Text style={styles.palaceName}>{data.palace_name || ''}</Text>
        <Text style={styles.chiName}>{data.chi_name}</Text>
      </View>
      
      {/* Tuần Triệt - Hiển thị ngay trên đầu nội dung */}
      {(hasTuan || hasTriet) && (
        <View style={styles.tuanTrietContainer}>
          {hasTuan && <Text style={styles.tuanText}>Tuần</Text>}
          {hasTriet && <Text style={styles.trietText}>Triệt</Text>}
        </View>
      )}

      <View style={styles.content}>
        {/* Chính tinh - To, Đỏ, ở giữa */}
        <View style={styles.chinhTinhContainer}>
          {data.chinh_tinh && data.chinh_tinh.map((sao, idx) => (
            <Text key={idx} style={styles.chinhTinhText} numberOfLines={1}>{sao}</Text>
          ))}
        </View>
        
        {/* Chia cột Cát tinh (Trái) và Hung tinh (Phải) */}
        <View style={styles.starColumns}>
          <View style={styles.catTinhCol}>
            {data.cat_tinh && data.cat_tinh.map((sao, idx) => (
              <Text key={idx} style={styles.catTinhText} numberOfLines={1}>{sao}</Text>
            ))}
          </View>

          <View style={styles.hungTinhCol}>
            {data.hung_tinh && data.hung_tinh.map((sao, idx) => (
              <Text key={idx} style={styles.hungTinhText} numberOfLines={1}>{sao}</Text>
            ))}
          </View>
        </View>
      </View>

      {/* Chân cung: Tháng, Vòng tràng sinh, Đại hạn */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.thangText}>{data.nguyet_han ? `Tháng ${data.nguyet_han}` : ''}</Text>
        </View>
        <View style={styles.footerCenter}>
            <Text style={styles.trangSinhText}>{data.trang_sinh}</Text>
        </View>
        <View style={styles.footerRight}>
          <Text style={styles.daiHanText}>{data.dai_han}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 140, // Đảm bảo đủ chỗ cho sao
    borderWidth: 0.5,
    borderColor: '#334155',
    padding: 2,
    backgroundColor: '#0F172A',
  },
  targetContainer: {
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    borderColor: '#FBBF24',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 2,
    marginBottom: 1,
  },
  palaceName: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 4,
  },
  chiName: {
    color: '#94A3B8',
    fontSize: 7.5,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  tuanTrietContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 1,
  },
  tuanText: {
    color: '#FB7185', 
    fontSize: 8,
    fontWeight: 'bold',
    borderWidth: 0.5,
    borderColor: '#FB7185',
    paddingHorizontal: 2,
    borderRadius: 2,
  },
  trietText: {
    color: '#F43F5E', 
    fontSize: 8,
    fontWeight: 'bold',
    borderWidth: 0.5,
    borderColor: '#F43F5E',
    paddingHorizontal: 2,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  chinhTinhContainer: {
    marginBottom: 2,
    alignItems: 'center',
  },
  chinhTinhText: {
    color: '#EF4444', 
    fontSize: 9.5,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 11,
  },
  starColumns: {
    flexDirection: 'row',
    flex: 1,
  },
  catTinhCol: {
    flex: 1,
    paddingRight: 1,
  },
  hungTinhCol: {
    flex: 1,
    paddingLeft: 1,
  },
  catTinhText: {
    color: '#10B981', 
    fontSize: 6.5,
    marginBottom: 0.5,
    lineHeight: 8,
  },
  hungTinhText: {
    color: '#94A3B8', 
    fontSize: 6.5,
    marginBottom: 0.5,
    lineHeight: 8,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#1E293B',
    paddingTop: 1,
    marginTop: 1,
  },
  footerLeft: { flex: 2 },
  footerCenter: { flex: 3, alignItems: 'center' },
  footerRight: { flex: 1, alignItems: 'flex-end' },
  thangText: {
    color: '#64748B',
    fontSize: 7.5,
  },
  trangSinhText: {
    color: '#60A5FA',
    fontSize: 7.5,
    fontWeight: '500',
  },
  daiHanText: {
    color: '#F8FAFC',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
});

export default PalaceBox;
