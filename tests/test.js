const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');

// The React app URL. In Jenkins pipeline with --network host, this accesses the frontend container port 8081.
const APP_URL = process.env.APP_URL || 'http://localhost:8081';

describe('Bazaar Hub Automated Test Suite (Selenium)', function () {
  let driver;

  before(async function () {
    let options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');

    // On Alpine Linux with chromium, the binary is here:
    options.setChromeBinaryPath('/usr/bin/chromium-browser');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('Test 1: Should load the home page successfully and verify title', async function () {
    await driver.get(APP_URL);
    const title = await driver.getTitle();
    expect(title).to.include('Bazaar Hub');
  });

  it('Test 2: Should navigate to the Login page', async function () {
    await driver.get(APP_URL + '/login');
    const pageSource = await driver.getPageSource();
    expect(pageSource).to.include('Sign in to your account');
  });

  it('Test 3: Should navigate to the Register page', async function () {
    await driver.get(APP_URL + '/register');
    const pageSource = await driver.getPageSource();
    expect(pageSource).to.include('Create your account');
  });

  it('Test 4: Should navigate to the Products page', async function () {
    await driver.get(APP_URL + '/products');
    const pageSource = await driver.getPageSource();
    expect(pageSource).to.include('All Products');
  });

  it('Test 5: Should navigate to the Auctions page', async function () {
    await driver.get(APP_URL + '/auctions');
    const pageSource = await driver.getPageSource();
    expect(pageSource).to.include('Active Auctions');
  });

  it('Test 6: Verify Navbar brand link exists', async function () {
    await driver.get(APP_URL);
    const navbarBrand = await driver.findElement(By.css('nav a'));
    const text = await navbarBrand.getText();
    expect(text).to.include('Bazaar Hub');
  });

  it('Test 7: Verify Login form has email and password fields', async function () {
    await driver.get(APP_URL + '/login');
    const emailInput = await driver.findElements(By.name('email'));
    const passwordInput = await driver.findElements(By.name('password'));
    expect(emailInput.length).to.be.greaterThan(0);
    expect(passwordInput.length).to.be.greaterThan(0);
  });

  it('Test 8: Verify Register form has name, email, password fields', async function () {
    await driver.get(APP_URL + '/register');
    const nameInput = await driver.findElements(By.name('name'));
    const emailInput = await driver.findElements(By.name('email'));
    expect(nameInput.length).to.be.greaterThan(0);
    expect(emailInput.length).to.be.greaterThan(0);
  });

  it('Test 9: Attempt to access protected Profile page without login (redirects to login)', async function () {
    await driver.get(APP_URL + '/profile');
    await driver.wait(until.urlContains('/login'), 5000);
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('Test 10: Attempt to access protected Checkout page without login (redirects to login)', async function () {
    await driver.get(APP_URL + '/checkout');
    await driver.wait(until.urlContains('/login'), 5000);
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('Test 11: Attempt to access protected Seller Dashboard without login (redirects to login)', async function () {
    await driver.get(APP_URL + '/seller/dashboard');
    await driver.wait(until.urlContains('/login'), 5000);
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('Test 12: Attempt to access protected Chat page without login (redirects to login)', async function () {
    await driver.get(APP_URL + '/chat');
    await driver.wait(until.urlContains('/login'), 5000);
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('Test 13: Attempt to access protected Orders page without login (redirects to login)', async function () {
    await driver.get(APP_URL + '/orders');
    await driver.wait(until.urlContains('/login'), 5000);
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('Test 14: Attempt to access Add Product page without login (redirects to login)', async function () {
    await driver.get(APP_URL + '/seller/add-product');
    await driver.wait(until.urlContains('/login'), 5000);
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('Test 15: Verify 404/Wildcard route redirects to Home', async function () {
    await driver.get(APP_URL + '/this-route-does-not-exist-12345');
    // The AppRoutes catches * and redirects to "/"
    // Sometimes it takes a moment to redirect.
    await driver.wait(async function() {
      const url = await driver.getCurrentUrl();
      // url should be APP_URL + '/' but avoid trailing slash mismatches
      return url === APP_URL || url === APP_URL + '/';
    }, 5000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.match(new RegExp(APP_URL + '/?$'));
  });

});
