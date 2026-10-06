import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bsod" role="alert">
      <div className="bsod__inner">
        <p className="bsod__lead">
          A problem has been detected and Windows has been shut down to prevent
          damage to your computer.
        </p>
        <p className="bsod__fault">PAGE_NOT_FOUND</p>
        <p className="bsod__body">
          If this is the first time you&apos;ve seen this Stop error screen,
          restart your computer. If this screen appears again, follow these
          steps:
        </p>
        <p className="bsod__body">
          Check that the URL is spelled correctly. If you changed anything
          recently, undo the change.
        </p>
        <p className="bsod__body bsod__body--spaced">
          If problems continue, disable or remove any newly installed routes or
          return to the voting desktop.
        </p>
        <p className="bsod__tech">Technical information:</p>
        <p className="bsod__stop">
          *** STOP: 0x00000404 (0x00000073, 0x00000068, 0x00000074, 0x00000058)
        </p>
        <p className="bsod__driver">SHTX_VOTING_PAGE_NOT_FOUND</p>
        <p className="bsod__action">
          <Link href="/" className="bsod__link">
            Press any key to return to the desktop
          </Link>
        </p>
      </div>
    </main>
  );
}
