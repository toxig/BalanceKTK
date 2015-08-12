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

#########################################
# Скрипт проверки баланса в АСР Атлант ЦБ
# Доступ к БД под пользователем MIGRNN
# Процедура проверки ABS_CHECK_BALANCE
# ver 1.0 - 27.02.2015 - AChernikov
#########################################

#$ENV{'ABS_IO_SOCKET'}='/usr/local/var/abs/xv3s';	# Test abs v.3

####################
# DB Connect params
####################
	my $avkdb_params = {
		 'datasource'   => "dbi:Oracle:host=192.168.167.114;sid=atldb;port=1521",
		 'username'	=> "MIGRNN",
		 'password'	=> "PE8X6BWU8",
		 'attr'		=> {PrintError => 0},
	};	

####################
# Main
####################
	# First of all print the header
    print "Content-Type: text/plain; charset=\"UTF-8\"\n\n";  #  charset=\"UTF-8\"	charset=\"WINDOWS-1251\" Content-Type: text/xml;
	
	printf "*** [db_connect]: User: %s\n",$db_params->{'username'};
	
    my $dbh
     = DBI->connect(
        $db_params->{'datasource'},
        $db_params->{'username'},
        $db_params->{'password'},
        $db_params->{'attr'}) or die "Cannot connect !! to database: $DBI::errstr\n";
    #$dbh->{oracle_auto_reconnect}=1;

	if ($dbh) { 
		{print "*** [db_connect]: DB Connected!\n";}		
	} else 
	{print "*** [db_connect]: DB NOT Connected!\n";}	
	
	print "Exit;";
		