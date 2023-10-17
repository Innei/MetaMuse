type Owner = Awaited<
  ReturnType<import('./user.service').UserService['getOwner']>
>
