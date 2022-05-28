import * as commander from 'commander';

import { AdminAirdropCommand } from './airdrop';
import { AdminBs58Command } from './utils';
import { AdminSetAuthorCommand } from './setAuthor';
import { AdminAddAdmin } from './addAdmin';
import { AdminRemoveAdmin } from './removeAdmin';
import { AdminAddReviewer } from './addReviewer';
import { AdminRemoveReviewer } from './removeReviewer';
import { AdminSetAmountForProposal } from './setAmountForProposal';

export function makeAdminCommand() {
  const admin = new commander.Command('admin')
    .addHelpCommand(false)
    .description('admin command')
    .configureHelp({
      helpWidth: 80,
      sortSubcommands: true,
      sortOptions: true,
    });

  admin.addCommand(AdminAirdropCommand());
  admin.addCommand(AdminSetAuthorCommand());
  admin.addCommand(AdminBs58Command());
  admin.addCommand(AdminAddAdmin());
  admin.addCommand(AdminRemoveAdmin());
  admin.addCommand(AdminAddReviewer());
  admin.addCommand(AdminRemoveReviewer());
  admin.addCommand(AdminSetAmountForProposal());

  return admin;
}