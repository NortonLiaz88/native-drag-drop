#import "LegacyDragDrop.h"

@implementation LegacyDragDrop
RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(multiply:(double)a
                  b:(double)b
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  NSNumber *result = @(a * b);
  resolve(result);
}

RCT_EXPORT_METHOD(move:(NSArray *)input
                  from:(double)from
                  to:(double)to
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  NSMutableArray *list = [input mutableCopy];
  NSInteger fromIdx = (NSInteger)from;
  NSInteger toIdx = (NSInteger)to;
  if (fromIdx >= 0 && fromIdx < list.count && toIdx >= 0 && toIdx < list.count) {
    id item = [list objectAtIndex:fromIdx];
    [list removeObjectAtIndex:fromIdx];
    [list insertObject:item atIndex:toIdx];
  }
  resolve(list);
}

RCT_EXPORT_METHOD(between:(double)value
                  min:(double)min
                  max:(double)max
                  inclusive:(BOOL)inclusive
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  BOOL result = inclusive ? (value >= min && value <= max) : (value > min && value < max);
  resolve(@(result));
}

RCT_EXPORT_METHOD(lastOrder:(NSArray *)orders
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  NSInteger count = 0;
  for (NSNumber *order in orders) {
    if ([order integerValue] != -1) {
      count++;
    }
  }
  resolve(@(count));
}

RCT_EXPORT_METHOD(remove:(NSArray *)orders
                  index:(double)index
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  NSInteger idx = (NSInteger)index;
  NSMutableArray *list = [NSMutableArray array];
  for (NSInteger i = 0; i < orders.count; i++) {
    if (i != idx && [orders[i] integerValue] != -1) {
      [list addObject:@(i)];
    }
  }
  [list sortUsingSelector:@selector(compare:)];
  NSMutableArray *result = [NSMutableArray array];
  for (NSInteger i = 0; i < list.count; i++) {
    [result addObject:@(i)];
  }
  resolve(result);
}

RCT_EXPORT_METHOD(reorder:(NSArray *)orders
                  from:(double)from
                  to:(double)to
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  NSMutableArray *values = [NSMutableArray array];
  for (NSNumber *order in orders) {
    if ([order integerValue] != -1) {
      [values addObject:order];
    }
  }
  NSInteger fromIdx = (NSInteger)from;
  NSInteger toIdx = (NSInteger)to;
  if (fromIdx >= 0 && fromIdx < values.count && toIdx >= 0 && toIdx < values.count) {
    id item = [values objectAtIndex:fromIdx];
    [values removeObjectAtIndex:fromIdx];
    [values insertObject:item atIndex:toIdx];
  }
  [values sortUsingSelector:@selector(compare:)];
  NSMutableArray *result = [NSMutableArray array];
  for (NSInteger i = 0; i < values.count; i++) {
    [result addObject:@(i)];
  }
  resolve(result);
}

RCT_EXPORT_METHOD(measureWords:(NSArray *)viewTags
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  NSMutableArray *result = [NSMutableArray array];
  for (NSNumber *tag in viewTags) {
    UIView *view = [self.bridge.uiManager viewForReactTag:tag];
    if (view) {
      CGRect frame = view.frame;
      NSMutableDictionary *map = [NSMutableDictionary dictionary];
      map[@"x"] = @(frame.origin.x);
      map[@"y"] = @(frame.origin.y);
      map[@"width"] = @(frame.size.width);
      map[@"height"] = @(frame.size.height);
      [result addObject:map];
    }
  }
  resolve(result);
}

RCT_EXPORT_METHOD(calculateLayout:(NSArray *)orders
                  widths:(NSArray *)widths
                  containerWidth:(double)containerWidth
                  wordHeight:(double)wordHeight
                  wordGap:(double)wordGap
                  lineGap:(double)lineGap
                  rtl:(BOOL)rtl
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  NSMutableArray *result = [NSMutableArray array];
  NSMutableArray *orderedItems = [NSMutableArray array];
  for (NSInteger i = 0; i < orders.count; i++) {
    NSNumber *order = orders[i];
    if ([order integerValue] != -1) {
      [orderedItems addObject:@[@(i), widths[i]]];
    }
  }
  [orderedItems sortUsingComparator:^NSComparisonResult(NSArray *obj1, NSArray *obj2) {
    return [orders[[obj1[0] integerValue]] compare:orders[[obj2[0] integerValue]]];
  }];

  NSInteger lineNumber = 0;
  NSInteger lineBreak = 0;
  for (NSArray *item in orderedItems) {
    NSInteger index = [item[0] integerValue];
    double width = [item[1] doubleValue];
    
    NSMutableDictionary *layout = [NSMutableDictionary dictionary];
    double currentTotal = 0;
    for (NSInteger i = lineBreak; i < index; i++) {
        currentTotal += [widths[i] doubleValue] + wordGap / 2;
    }

    if (currentTotal + width > containerWidth) {
      lineNumber += 1;
      lineBreak = index;
      layout[@"x"] = @(rtl ? containerWidth - width : 0.0);
    } else {
      layout[@"x"] = @(rtl ? containerWidth - currentTotal - width : currentTotal);
    }
    layout[@"y"] = @((wordHeight + lineGap) * lineNumber + lineGap / 2);
    [result addObject:layout];
  }
  resolve(result);
}

@end
