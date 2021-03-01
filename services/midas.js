const puppeteer = require('puppeteer')

class MidasScraper {
  constructor(midasUsername, midasPassword, unipinUsername, unipinPassword, unipinAccessCode) {
    this.unipinUsername = unipinUsername;
    this.unipinPassword = unipinPassword;
    this.unipinAccessCode = unipinAccessCode;
    this.midasUsername = midasUsername;
    this.midasPassword = midasPassword;
  }
  async login(page) {
    console.log('start opening midas login page > ')
    this.step = 'OPEN_MIDAS_LOGIN'
    await page.goto('https://www.midasbuy.com/midasbuy/id/login');
    await page.type('#loginUsername', this.midasUsername);
    await page.type('#loginPassword', this.midasPassword);
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2' })
    console.log('login midas success > ')
    this.step = 'LOGIN_MIDAS_SUCCESS'

  }

  async buyPubg(playerId, productAmount, cb) {
    const availableAmount = [250, 500, 1250, 2500, 5000, 7500]
    this.step = 'START'
    if (!availableAmount.includes(productAmount)) {
      return cb({ status: 'ERROR', data: { step: this.step }, error: 'product not found' })
    }
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gl-drawing-for-tests',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    try {
      const page = await this.browser.newPage();
      this.start = Date.now();

      await page.setRequestInterception(true);
      page.on('request', (request) => {
        if (request.resourceType() === 'image') request.abort();
        else request.continue();
      });
      page.on('response', async (response) => {
        if (response.url().includes('getCharac')) {
          const jsonres = await response.json()
          if (jsonres.ret == 2002) {
            return cb({ status: 'ERROR', data: { step: this.step }, error: 'playerid not found' })
          }
        }
      });

      await this.login(page)
      await page.goto('https://www.midasbuy.com/midasbuy/id/buy/pubgm');
      // set playerid
      await page.click('#app > div.content > div.x-main > div.tab-nav-box > div > div > div > div.edit-btn')
      await page.waitForSelector('#app > div.content > div.x-main > div.tab-nav-box > div > div > div > div.input-box > input')
      await page.type('#app > div.content > div.x-main > div.tab-nav-box > div > div > div > div.input-box > input', playerId)
      await page.click('#app > div.content > div.x-main > div.tab-nav-box > div > div > div > div.btn')
      this.step = 'SET_PLAYER_ID'

      // set unipin payment
      await page.click('#app > div.content > div.x-main > div.pay-type-box.payment > div.pay-list-box.g-clr > ul > li:nth-child(4)')
      // set amount
      await page.click(`#app > div.content > div.x-main > div.section.game-pay-section > ul > li[cr='amount_select.${productAmount}']`)
      await page.waitForSelector('#app > div.content > div.pay-sec > div.x-main > div.right > div.pay-btn.disable', { hidden: true })
      
      await page.click('#app > div.content > div.pay-sec > div.x-main > div.right > div.pay-btn')
      this.step = 'CHECKOUT_MIDAS'
      await page.waitForTimeout(500)
      const responseUnipin = await this.loginAndCheckoutUnipin()
      return cb(responseUnipin)
    } catch (error) {
      return cb({ status: 'ERROR', data: { step: this.step }, error: 'catch: ' + error })
    }
    finally {
      await this.browser.close()
    }

  }

  async loginAndCheckoutUnipin() {
    // click unipin credits option
    this.step = 'REDIRECT_UNIPIN'
    const pages = await this.browser.pages()
    await pages[2].waitForNavigation({ waitUntil: 'networkidle2' })
    const page = pages[2]
    page.click('#pc_div_55 > div.payment-icon-nominal')
    await page.waitForNavigation({ waitUntil: 'networkidle2' })

    // login unipin
    await page.type('#loginEmail', this.unipinUsername);
    await page.type('#loginPassword', this.unipinPassword);
    page.keyboard.press('Enter')
    await page.waitForNavigation({ waitUntil: 'networkidle2' })
    console.log('login unipin success > ');
    this.step = 'LOGIN_UNIPIN_SUCCESS'

    // unipin key
    await page.type('#security_key', this.unipinAccessCode);
    await page.click('body > section > div.col-md-6.col-md-offset-3 > div > div:nth-child(4) > div > form > div.text-center > input')
    console.log('click pay button unipin > ');
    console.log('took', Date.now() - this.start, 'ms');
    this.step = 'PAY_UNIPIN'
    await page.waitForNavigation({ waitUntil: 'networkidle2' })
    try {
      const trans_id = await page.$eval('#trans_id', el => el.textContent);
      return { status: 'SUCCESS', data: { step: this.step, providerReference: trans_id } }
    } catch (error) {
      return { status: 'SUCCESS', data: { step: this.step, providerReference: '' } }
    }
  }
}


module.exports = MidasScraper