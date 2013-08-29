var get = Ember.get, set = Ember.set;

/**
 * `Ember.PageableMixin` provides a standard interface to narrow the view of
 * data to a given page, as a function of `pageNumber`, `pageSize`, and content.
 * 
 * controller = Ember.ArrayController.extend(Ember.PageableMixin, { content: [
 * 1, 2, 3 ], });
 * 
 * controller.set('pageSize', 2);
 * 
 * ```
 * 
 * @class PageableMixin
 * @namespace Ember
 * @extends Ember.Mixin
 * @uses Ember.MutableEnumerable
 */

Ember.PageableMixin = Ember.Mixin.create(Ember.MutableEnumerable, {
  pageNumber : 0,
  pageSize : 10,
  _viewChanged : false, // current hackish approach to determine when arranged
  // content must be updated. this should only happen if
  // the range of items within the current view would
  // change

  /**
   * Gets number of pages.
   */
  pageCount : Ember.computed('arrangedContent.length', 'pageSize', function() {

    return Math.ceil(get(this, 'arrangedContent.length') / get(this, 'pageSize'));

  }).cacheable(),

  pages : function() {

    var pageCount = this.get('pageCount'), pages = [], page;

    for (i = 0; i < pageCount; i++) {
      page = i + 1;
      pages.push(page);
    }

    return pages;

  }.property('pageCount'),

  showPager : Ember.computed.gt('pageCount', 1),

  _resetPageToZero : Ember.observer(function() {
    // what does it mean for page size to change and for us to be on
    // page X? there is no way to figure this out, so we default to
    // setting page back to 0

    set(this, 'pageNumber', 0);
  }, 'pageSize', 'arrangedContent'),

  contentArrayDidChange : function(array, idx, removedCount, addedCount) {
    var pageNumber = get(this, 'pageNumber');
    var pageSize = get(this, 'pageSize');

    var start = pageNumber * pageSize;
    var end = start + pageSize;

    if (idx <= end && idx + removedCount + addedCount >= start) {
      this.toggleProperty('_viewChanged');
    }

    return this._super(array, idx, removedCount, addedCount);
  },

  pagedContent : Ember.computed('_viewChanged', 'arrangedContent', 'pageNumber', 'pageSize', function() {
    var content = get(this, 'arrangedContent');
    if (!content) {
      return Ember.A([]);
    }

    var pageSize = get(this, 'pageSize');
    var start = get(this, 'pageNumber') * pageSize;
    var end = start + pageSize;
    return content.slice(start, end);
  }).cacheable(),

  /**
   * Decrements pageNumber. If pageNumber is already 0, does nothing.
   */
  decrementPage : function() {
    this.set('pageNumber', Math.max(get(this, 'pageNumber') - 1, 0));
  },

  /**
   * Set pageNumber to next possible. Does not increment if on highest
   * pageNumber.
   */
  incrementPage : function() {
    set(this, 'pageNumber', Math.min(get(this, 'pageNumber') + 1, get(this, 'pageCount') - 1));
  },

  /**
   * Set pageNumber to visible page value (pageNumber - 1).
   */
  setPage : function(pageNumber) {
    set(this, 'pageNumber', parseInt(pageNumber, 10) - 1);
  },

  /**
   * Returns if the current pageNumber is the first.
   */
  onFirstPage : Ember.computed('pageNumber', function() {
    return get(this, 'pageNumber') === 0;
  }).cacheable(),

  /**
   * Returns if the current pageNumber is the last.
   */
  onLastPage : Ember.computed('pageNumber', 'pageCount', function() {
    return get(this, 'pageNumber') === get(this, 'pageCount') - 1;
  }).cacheable()
});

Ember.PageableController = Ember.ArrayController.extend(Ember.PageableMixin, {});
