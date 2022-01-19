/**
 * Note: this suite is disabled, because the click handler in observeEIDLink
 * calls `location.assign(...)` and there is no way for jasmine to mock this
 * call as the browser's location object is not "spy"able.
 * We need to find another way of testing this. For now, this is a manual step.
 */
xdescribe("observeEIDLink", function () {
  var target, notInstalledCallback;

  beforeEach(function () {
    jasmine.clock().install();
    target = document.createElement("a");
    target.href = "javascript:void(0);";
    notInstalledCallback = jasmine.createSpy("notInstalledCallback");
  });

  afterEach(function () {
    jasmine.clock().uninstall();
  });

  it("fires notInstalledCallback, when no browser reaction is observed", function () {
    AusweisApp2.observeEIDLink(target, notInstalledCallback);
    target.click();
    jasmine.clock().tick(1000);
    expect(notInstalledCallback).toHaveBeenCalled();
  });
});
