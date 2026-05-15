/**
 * CustomDatePicker.js
 *
 * iOS + Android dono pe smooth drum roller.
 *
 * iOS issues jo fix kiye:
 *  - decelerationRate 0.992 → "normal": momentum settle nahi hota tha → snap hang fix
 *  - dragEndTimer 50ms → 120ms: race condition fix (momentum event 50ms ke baad bhi fire hota tha)
 *  - scrollEventThrottle iOS pe 1: accurate offset → snap sahi position pe
 *  - onScrollEndDrag + onMomentumScrollEnd double-snap → timer + flag se fix
 *  - Unselected item opacity: 0.42→0.65, 0.16→0.35 → clearly visible
 *  - drumText color: gray400 → gray600 → better contrast
 *  - iOS fast scroll stuck fix: watchdog timer via onScroll — agar momentum end fire na ho
 *    (known RN iOS bug: fast scroll to boundary pe onMomentumScrollEnd kabhi nahi aata)
 *    → 300ms scroll-idle detect karo, manually snap karo, flags reset karo
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, Modal, ScrollView,
  TouchableOpacity, StyleSheet, Platform,
} from 'react-native';

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEM_H  = 48;
const VISIBLE = 5;
const DRUM_H  = ITEM_H * VISIBLE;
const PAD     = ITEM_H * Math.floor(VISIBLE / 2);   // 2 rows

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const C = {
  primary:     '#059669',
  primaryBg:   '#d1fae5',
  primaryDark: '#065f46',
  gray50:      '#f9fafb',
  gray200:     '#e5e7eb',
  gray300:     '#abb1ba',
  gray400:     '#70747b',
  gray600:     '#4b5563',   // ← naya: unselected text ke liye better contrast
  gray800:     '#1f2937',
  white:       '#ffffff',
};

const IS_IOS = Platform.OS === 'ios';

// ─── DrumColumn ───────────────────────────────────────────────────────────────

const DrumColumn = ({ items, selectedIndex, onSelect, renderLabel }) => {
  const scrollRef     = useRef(null);
  const isMounted     = useRef(false);
  const isDragging    = useRef(false);
  const hasMomentum   = useRef(false);
  const lastCommitted = useRef(selectedIndex);

  // ── scroll to exact row ──────────────────────────────────────────────────
  const scrollTo = useCallback((index, animated) => {
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    scrollRef.current?.scrollTo({ y: clamped * ITEM_H, animated });
  }, [items.length]);

  // ── initial position ─────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      scrollTo(selectedIndex, false);
      isMounted.current = true;
    }, IS_IOS ? 150 : 80);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── sync when parent clamps index (month change → fewer days) ────────────
  useEffect(() => {
    if (!isMounted.current) return;
    if (isDragging.current || hasMomentum.current) return;
    if (lastCommitted.current === selectedIndex) return;
    lastCommitted.current = selectedIndex;
    scrollTo(selectedIndex, true);
  }, [selectedIndex, scrollTo]);

  // ── commit snap to nearest item ──────────────────────────────────────────
  const commitSnap = useCallback((offsetY) => {
    const clamped = Math.max(0, Math.min(Math.round(offsetY / ITEM_H), items.length - 1));
    scrollTo(clamped, true);
    if (lastCommitted.current !== clamped) {
      lastCommitted.current = clamped;
      onSelect(clamped);
    }
  }, [items.length, onSelect, scrollTo]);

  // ── iOS watchdog ─────────────────────────────────────────────────────────
  // Known RN iOS bug: fast scroll to list boundary pe onMomentumScrollEnd
  // kabhi fire nahi hota — scroll atak jata hai, flags stuck rehte hain.
  // Fix: onScroll ke through last-seen Y track karo. Agar 300ms tak Y change
  // na ho aur hasMomentum true ho, manually snap karo aur flags reset karo.
  const watchdogTimer  = useRef(null);
  const lastScrollY    = useRef(0);

  const resetWatchdog = useCallback((y) => {
    lastScrollY.current = y;
    if (watchdogTimer.current) clearTimeout(watchdogTimer.current);
    watchdogTimer.current = setTimeout(() => {
      if (hasMomentum.current || isDragging.current) {
        // Scroll ruk gaya but end events nahi aaye — force snap + reset
        isDragging.current  = false;
        hasMomentum.current = false;
        commitSnap(lastScrollY.current);
      }
    }, 300);
  }, [commitSnap]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (watchdogTimer.current) clearTimeout(watchdogTimer.current);
    if (dragEndTimer.current)  clearTimeout(dragEndTimer.current);
  }, []);

  // ── scroll handlers ──────────────────────────────────────────────────────

  const handleScrollBeginDrag = useCallback(() => {
    isDragging.current  = true;
    hasMomentum.current = false;
  }, []);

  const handleMomentumEnd = useCallback((e) => {
    isDragging.current  = false;
    hasMomentum.current = false;
    if (watchdogTimer.current) clearTimeout(watchdogTimer.current);
    commitSnap(e.nativeEvent.contentOffset.y);
  }, [commitSnap]);

  const dragEndTimer = useRef(null);

  const handleScrollEndDrag = useCallback((e) => {
    isDragging.current = false;
    const y = e.nativeEvent.contentOffset.y;

    if (IS_IOS) {
      dragEndTimer.current = setTimeout(() => {
        if (!hasMomentum.current) {
          if (watchdogTimer.current) clearTimeout(watchdogTimer.current);
          commitSnap(y);
        }
      }, 120);
    } else {
      const vy = e.nativeEvent.velocity?.y ?? 0;
      if (Math.abs(vy) < 0.2) {
        commitSnap(y);
      }
    }
  }, [commitSnap]);

  const handleMomentumBeginWithCancel = useCallback(() => {
    hasMomentum.current = true;
    if (dragEndTimer.current) {
      clearTimeout(dragEndTimer.current);
      dragEndTimer.current = null;
    }
  }, []);

  // onScroll: watchdog feed karo (iOS only — Android ko zaroorat nahi)
  const handleScroll = useCallback((e) => {
    if (IS_IOS) {
      resetWatchdog(e.nativeEvent.contentOffset.y);
    }
  }, [resetWatchdog]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.col}
      contentContainerStyle={{ paddingVertical: PAD }}
      showsVerticalScrollIndicator={false}
      decelerationRate={IS_IOS ? 'normal' : 0.88}
      onScroll={handleScroll}
      onScrollBeginDrag={handleScrollBeginDrag}
      onMomentumScrollBegin={handleMomentumBeginWithCancel}
      onMomentumScrollEnd={handleMomentumEnd}
      onScrollEndDrag={handleScrollEndDrag}
      scrollEventThrottle={IS_IOS ? 16 : 16}
      bounces={IS_IOS}
      overScrollMode="never"
    >
      {items.map((item, i) => {
        const dist       = Math.abs(i - selectedIndex);
        const isSelected = dist === 0;

        // Pehle: dist=1 → 0.42 (too faded), dist=2 → 0.16 (almost invisible)
        // Ab: dist=1 → 0.65 (clearly readable), dist=2 → 0.35 (subtle but visible)
        const opacity = dist === 0 ? 1 : dist === 1 ? 0.65 : dist === 2 ? 0.35 : 0.15;
        const scale   = dist === 0 ? 1 : dist === 1 ? 0.90 : dist === 2 ? 0.80 : 0.70;

        return (
          <TouchableOpacity
            key={i}
            activeOpacity={0.65}
            style={styles.drumItem}
            onPress={() => {
              lastCommitted.current = i;
              onSelect(i);
              scrollTo(i, true);
            }}
          >
            <Text style={[
              styles.drumText,
              isSelected && styles.drumTextSelected,
              { opacity, transform: [{ scale }] },
            ]}>
              {renderLabel(item)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

// ─── CustomDatePicker ─────────────────────────────────────────────────────────

const CustomDatePicker = ({
  visible,
  onClose,
  onConfirm,
  initialValue,
  title   = 'Date of Birth',
  minYear,
  maxYear,
}) => {
  const today = new Date();
  const maxYr = maxYear ?? today.getFullYear();
  const minYr = minYear ?? maxYr - 100;

  const initDate = (() => {
    if (!initialValue) return today;
    const [d, m, y] = initialValue.split('/');
    const p = new Date(`${y}-${m}-${d}`);
    return isNaN(p.getTime()) ? today : p;
  })();

  const years     = Array.from({ length: maxYr - minYr + 1 }, (_, i) => maxYr - i);
  const initYrIdx = Math.max(0, years.findIndex((y) => y === initDate.getFullYear()));

  const [yearIdx,  setYearIdx]  = useState(initYrIdx);
  const [monthIdx, setMonthIdx] = useState(initDate.getMonth());
  const [dayIdx,   setDayIdx]   = useState(initDate.getDate() - 1);

  const selectedYear = years[yearIdx] ?? maxYr;
  const daysInMonth  = new Date(selectedYear, monthIdx + 1, 0).getDate();
  const days         = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const safeDayIdx   = Math.min(dayIdx, daysInMonth - 1);

  useEffect(() => {
    if (dayIdx > daysInMonth - 1) setDayIdx(daysInMonth - 1);
  }, [monthIdx, yearIdx]);

  const handleConfirm = () => {
    const d = String(safeDayIdx + 1).padStart(2, '0');
    const m = String(monthIdx + 1).padStart(2, '0');
    onConfirm(`${d}/${m}/${selectedYear}`);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <View style={styles.sheet}>

        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{title}</Text>

          <TouchableOpacity
            onPress={handleConfirm}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            style={styles.doneBtn}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Preview */}
        <View style={styles.preview}>
          <Text style={styles.previewText}>
            {String(safeDayIdx + 1).padStart(2, '0')}
            {'  '}{MONTHS[monthIdx]}{'  '}
            {selectedYear}
          </Text>
        </View>

        {/* Column labels */}
        <View style={styles.colHeaders}>
          <Text style={styles.colHeader}>Day</Text>
          <Text style={styles.colHeader}>Month</Text>
          <Text style={styles.colHeader}>Year</Text>
        </View>

        {/* Drum row */}
        <View style={styles.drumsRow}>
          <View style={styles.highlight} pointerEvents="none" />

          <DrumColumn
            items={days}
            selectedIndex={safeDayIdx}
            onSelect={setDayIdx}
            renderLabel={(d) => String(d).padStart(2, '0')}
          />
          <DrumColumn
            items={MONTHS}
            selectedIndex={monthIdx}
            onSelect={setMonthIdx}
            renderLabel={(m) => m.slice(0, 3)}
          />
          <DrumColumn
            items={years}
            selectedIndex={yearIdx}
            onSelect={setYearIdx}
            renderLabel={(y) => String(y)}
          />
        </View>

        {/* Hairline dividers */}
        <View
          style={[styles.hairline, { bottom: ITEM_H * 3 + 4 }]}
          pointerEvents="none"
        />

      </View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingBottom: IS_IOS ? 44 : 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 24,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.gray300,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.gray200,
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: C.gray800 },
  cancelText:  { fontSize: 16, color: C.gray400 },
  doneBtn: {
    backgroundColor: C.primary,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 22,
  },
  doneBtnText: { fontSize: 14, fontWeight: '700', color: C.white },

  preview: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: C.gray50,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.gray200,
  },
  previewText: {
    fontSize: 22,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 0.5,
  },

  colHeaders: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 2,
  },
  colHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: C.gray400,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  drumsRow: {
    flexDirection: 'row',
    height: DRUM_H,
    marginTop: 4,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  col: { flex: 1 },

  drumItem: {
    height: ITEM_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drumText: {
    fontSize: 17,
    color: C.gray600,   // ← gray400 se gray600: better contrast for unselected items
    fontWeight: '400',
  },
  drumTextSelected: {
    fontSize: 21,
    color: C.primaryDark,
    fontWeight: '700',
  },

  highlight: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: ITEM_H * 2,
    height: ITEM_H,
    backgroundColor: C.primaryBg,
    borderRadius: 14,
    zIndex: 0,
  },
  hairline: {
    position: 'absolute',
    left: 22,
    right: 22,
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.gray300,
  },
});

export default CustomDatePicker;