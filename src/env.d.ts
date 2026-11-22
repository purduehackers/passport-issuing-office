declare namespace App {
  interface Locals {
    user: import("./lib/server/auth").User | null;
  }
}
