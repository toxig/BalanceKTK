#!/usr/bin/perl
use strict;
use CGI;
use XML::Simple;
use IO::Handle '_IOLBF';
use IO::File;
use GnuPG::Interface ;
use Net::EasyTCP;
use Data::Dumper;
use DBI;
use URI::Escape;
use Encode;
use CGI::Carp qw(fatalsToBrowser);
use DBD::Oracle qw(:ora_types);
#########################################
# Скрипт проверки баланса в АСР Атлант ЦБ
# Доступ к БД под пользователем MIGRNN
# Процедура проверки ABS_CHECK_BALANCE
# ver 1.0 - 27.02.2015 - AChernikov
#########################################

#$ENV{'ABS_IO_SOCKET'}='/usr/local/var/abs/xv3s';	# Test abs v.3
$ENV{NLS_LANG}="AMERICAN_CIS.CL8MSWIN1251"; 
$ENV{ORACLE_HOME}="/u01/app/oracle/product/10.2.0/client_1";
####################
# DB Connect params
####################
	my $db_params = {
		 'datasource'   => "dbi:Oracle:host=192.168.167.114;sid=atldb;port=1521",
		 'username'	=> "MIGRNN",
		 'password'	=> "PE8X6BWU8",
		 'attr'		=> {PrintError => 1}
	};	

	#DBI_TRACE=1=dbitrace.log;
	DBI->trace(2);	
####################
# Main
####################
	# First of all print the header
    print "Content-Type: text/plain; charset=\"WINDOWS-1251\"\n\n";  #  charset=\"UTF-8\"	charset=\"WINDOWS-1251\" Content-Type: text/xml;		
	
	my($sec,$min,$hour,$mday,$mon,$year) = localtime(time);
	my $timestamp = sprintf "%4d.%02d.%02d %02d:%02d:%02d",1900+$year, $mon+1, $mday, $hour, $min, $sec;
	print "Start: $timestamp\n";
	
	# my $db_host = "192.168.167.105";
	# my $db_base = "atldb";
	# my $db_port = 1521;
	# my $db_user = "ACHERNIKOV";
	# my $db_password = "xsw23edc";
	
	# my $host = "213.132.79.130";
	# my $sid = "oracle";
	# my $port = 1521;
	# my $user = "ATLANT";
	# my $passwd = "atlant";	

	my $host = "192.168.167.114";
	my $sid = "atldb";
	my $port = 1521;
	my $user = "MIGRNN";
	my $passwd = "PE8X6BWU8";	
	
	#printf "*** [db_connect]: User: %s\n",$db_user;
	
	
	#my $dbh;
	
    my $dbh = DBI->connect ( "dbi:Oracle:host=$host;sid=$sid;port=$port", $user, $passwd,{PrintError=>1,RaiseError => 1} ) or die "Cannot connect !! to database: $DBI::errstr\n";    

	#my $dbh = DBI->connect("dbi:Oracle:host=$host;sid=$sid", $user, $passwd);
	
	  if ($dbh) { 
		  print "*** [db_connect]: DB Connected!\n";
	  } 
	 else 
	 {print "*** [db_connect]: DB NOT Connected!\n";}	
	
	
	my @drivers = DBI->available_drivers;
	print "Доступны следующие драйверы:\n" . join("\n",@drivers) . "\nНо нас  интересуют только mSQL и mysql. :)\n";
	
	$dbh->disconnect;
	
	print "Exit;";
		