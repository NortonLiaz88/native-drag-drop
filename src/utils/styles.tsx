import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  computeWordLayoutContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0,
  },
  center: {
    justifyContent: 'center',
  },
  right: {
    justifyContent: 'flex-end',
  },
  left: {
    justifyContent: 'flex-start',
  },
});
