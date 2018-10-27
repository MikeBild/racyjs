# How to Contribute

First off, we really value your contribution. Thanks for wanting to help us with
your time and talent! :rainbow:

## Did you find a bug?

- Ensure the bug was not already reported by searching on GitHub under
  [Issues](https://github.com/mikebild/racyjs/issues).

- If you're unable to find an open issue addressing the problem,
  [open a new one](https://github.com/mikebild/racyjs/issues/new). Be sure to
  include a title and clear description, as much relevant information as
  possible, and a code sample or an executable test case demonstrating the
  expected behavior that is not occurring.

## Did you write a patch that fixes a bug?

- Follow semantic commits to simplify releases and change log generation please

  - patch: Bug fixes
  - minor: Backward-compatible updates
  - major: Introducing breaking changes
  - ignore: Do not include this commit in changelog

  | semantic type | description                | commit type | 0.y.z |
  | ------------- | -------------------------- | ----------- | ----- |
  | chore         | changes to build process   | ignore      |       |
  | docs          | documentation only changes | ignore      |       |
  | feat          | a new feature              | minor       | patch |
  | fix           | bug fix                    | patch       |       |
  | refactor      | code refactor              | patch       |       |
  | style         | code style changes         | ignore      |       |
  | test          | add missing tests          | ignore      |       |
  | breaking      | introduce breaking changes | major       | minor |
  | perf          | performance improvements   | patch       |       |
  | tweaks        | don't know how to describe | patch       |       |

- Open a new GitHub pull request with the patch.

- Ensure the PR description clearly describes the problem and solution. Include
  the relevant issue number if applicable.

## Do you intend to add a new feature or change an existing one?

- Suggest your change as an issue on GitHub to collect positive feedback about
  the proposal before starting to actually write code.

Thanks! :heart:
