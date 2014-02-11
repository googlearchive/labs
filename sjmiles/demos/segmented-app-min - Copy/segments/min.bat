@ECHO OFF

CALL :min-polymer async
CALL :min main
CALL :min chart
CALL :min splash

GOTO :EOF

:min

SET CMD=vulcanize %~n1.html --inline  --strip --config vulcan.json -o ../min/%~n1.html
ECHO %CMD%
CALL %CMD%

GOTO :EOF

:min-polymer

SET CMD=vulcanize %~n1.html --inline  --strip -o ../min/%~n1.html
ECHO %CMD%
CALL %CMD%

GOTO :EOF