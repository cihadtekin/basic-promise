"use strict"

class BasicPromise {

  constructor(executor) {
    this.status = "pending"
    this.callbackQueue = []

    typeof executor === "function" && executor(
      this.resolve.bind(this),
      this.reject.bind(this)
    )
  }

  then(onResolve, onReject) {
    onResolve && this.callbackQueue.push({
      cb: onResolve,
      type: "resolved"
    })

    onReject && this.callbackQueue.push({
      cb: onReject,
      type: "rejected"
    })

    this.status !== "pending" && this.fulfil()

    return this;
  }

  catch(onReject) {
    this.callbackQueue.push({
      cb: onReject,
      type: "rejected"
    })

    this.status !== "pending" && this.fulfil()

    return this;
  }

  resolve(...args) {
    this.status = "resolved"
    this.args = args

    return this.fulfil()
  }

  reject(...args) {
    this.status = "rejected"
    this.args = args

    return this.fulfil()
  }

  fulfil() {
    var item, ret

    if (this.status === "pending") {
      return this
    }

    while (item = this.callbackQueue.shift()) {
      if (item.type === this.status) {
        ret = item.cb(...this.args)

        if (ret instanceof BasicPromise) {
          ret.callbackQueue = ret.callbackQueue.concat(this.callbackQueue)
          this.callbackQueue = []

          ret.fulfil()

          break
        }
      }
    }

    return this;
  }

  static resolve() {
    return BasicPromise.create().resolve()
  }

  static reject() {
    return BasicPromise.create().reject()
  }

  static create(executor) {
    return new BasicPromise(executor);
  }

}

if (module && module.exports) {
  module.exports = BasicPromise;
}