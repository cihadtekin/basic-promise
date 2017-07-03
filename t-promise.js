"use strict"

class TPromise {

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

    return this
  }

  catch(onReject) {
    this.callbackQueue.push({
      cb: onReject,
      type: "rejected"
    })

    this.status !== "pending" && this.fulfil()

    return this
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

        if (ret instanceof TPromise) {
          ret.callbackQueue = ret.callbackQueue.concat(this.callbackQueue)
          this.callbackQueue = []

          ret.fulfil()

          break
        }
      }
    }

    return this
  }

  static resolve() {
    return TPromise.create().resolve()
  }

  static reject() {
    return TPromise.create().reject()
  }

  static create(executor) {
    return new TPromise(executor)
  }

}

if (typeof module !== "undefined" && module.exports) {
  module.exports = TPromise
}